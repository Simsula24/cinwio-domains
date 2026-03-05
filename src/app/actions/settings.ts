"use server";

import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://domaindb.cinwio.com/';
const HMAC_SECRET = process.env.RESEND_API_TOKEN || 'fallback-secret-for-dev-only';

function createSecureToken(payload: object): string {
    const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto.createHmac('sha256', HMAC_SECRET).update(data).digest('base64url');
    return `${data}.${signature}`;
}

async function getPb() {
    const cookieStore = await cookies();
    const pbAuth = cookieStore.get('pb_auth')?.value;
    if (!pbAuth) return { error: 'Not authenticated' };

    const pb = new PocketBase(pbUrl);
    pb.authStore.save(pbAuth, null);
    if (!pb.authStore.isValid) return { error: 'Not authenticated' };

    return { pb };
}

export async function updateAccountInfo(prevState: any, formData: FormData) {
    const { pb, error } = await getPb();
    if (error || !pb) return { error };

    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const phone = formData.get('phone') as string;
    const company = formData.get('company') as string;
    const currency = formData.get('currency') as string;

    try {
        await pb.collection('users').authRefresh();
        const userId = pb.authStore.model?.id;

        if (!userId) return { error: 'Invalid user session.' };

        await pb.collection('users').update(userId, {
            name,
            address,
            phone,
            company,
            currency
        });
        return { success: true, message: 'Account information updated successfully.' };
    } catch (err: any) {
        return { error: 'Failed to update account information.' };
    }
}

export async function updatePassword(prevState: any, formData: FormData) {
    const { pb, error } = await getPb();
    if (error || !pb) return { error };

    const oldPassword = formData.get('oldPassword') as string;
    const password = formData.get('password') as string;
    const passwordConfirm = formData.get('passwordConfirm') as string;

    if (password !== passwordConfirm) {
        return { error: 'New passwords do not match.' };
    }

    if (password.length < 8) {
        return { error: 'New password must be at least 8 characters long.' };
    }

    try {
        await pb.collection('users').authRefresh();
        const userId = pb.authStore.model?.id;

        if (!userId) return { error: 'Invalid user session.' };

        // PocketBase update auth record password requires old password
        await pb.collection('users').update(userId, {
            oldPassword,
            password,
            passwordConfirm,
        });

        return { success: true, message: 'Password updated successfully.' };
    } catch (err: any) {
        return { error: err?.response?.message || 'Failed to update password. Did you enter the correct old password?' };
    }
}

export async function updateEmails(prevState: any, formData: FormData) {
    const { pb, error } = await getPb();
    if (error || !pb) return { error };

    const email = formData.get('email') as string;
    const secondaryEmail = formData.get('secondaryEmail') as string;

    try {
        await pb.collection('users').authRefresh();
        const user = pb.authStore.model;
        if (!user || !user.id) return { error: 'Invalid user session.' };

        // 1. Save secondary email straight to the user
        // We trigger verification by saving a securely signed token link
        let verifyLink = '';
        if (user.secondaryEmail !== secondaryEmail && secondaryEmail) {
            await pb.collection('users').update(user.id, {
                secondaryEmail,
                secondaryEmailVerified: false
            });

            // Generate a server-signed secure token
            const secureToken = createSecureToken({ id: user.id, email: secondaryEmail, timestamp: Date.now() });
            verifyLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://domains.cinwio.com'}/verify-secondary?token=${secureToken}`;

            // Send the verification email using Resend API
            try {
                const resendToken = process.env.RESEND_API_TOKEN;
                if (resendToken) {
                    const prettyHtml = `
                    <div style="font-family: Arial, sans-serif; padding: 40px 20px; background-color: #f8fafc; color: #0f172a;">
                        <div style="max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); text-align: center;">
                            <h2 style="color: #4f46e5; margin-bottom: 20px;">Verify Your Secondary Email</h2>
                            <p style="font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 30px;">
                                You recently added or changed the secondary email address for your CINWIO Domains account. Please click the button below to verify it.
                            </p>
                            <a href="${verifyLink}" style="background-color: #4f46e5; color: white; padding: 12px 28px; text-decoration: none; font-size: 16px; border-radius: 6px; display: inline-block; font-weight: bold;">
                                Verify Email Address
                            </a>
                            <p style="font-size: 14px; color: #94a3b8; margin-top: 30px; line-height: 1.5;">
                                If you did not request this, you can safely ignore this email.
                            </p>
                            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;"/>
                            <p style="font-size: 12px; color: #94a3b8;">
                                If the button does not work, copy and paste this link into your browser:<br><br>
                                <a href="${verifyLink}" style="color: #4f46e5; word-break: break-all;">${verifyLink}</a>
                            </p>
                        </div>
                    </div>
                    `;

                    await fetch('https://api.resend.com/emails', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${resendToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            from: 'CINWIO Domains <noreply@cinwio.com>',
                            to: secondaryEmail,
                            subject: 'Verify your secondary email',
                            html: prettyHtml
                        })
                    });
                    console.log("Verification email sent via Resend API.");
                } else {
                    console.log("⚠️ No RESEND_API_TOKEN found. Cannot send email.");
                }
            } catch (err) {
                console.error("Failed to call Resend API:", err);
            }
        } else if (user.secondaryEmail !== secondaryEmail && !secondaryEmail) {
            // Clearing it
            await pb.collection('users').update(user.id, {
                secondaryEmail: '',
                secondaryEmailVerified: false
            });
        }

        // 2. Changing the primary email in PocketBase requires a special endpoint
        let message = 'Emails updated successfully.';
        if (user.email !== email && email) {
            await pb.collection('users').requestEmailChange(email);
            message = 'A verification link has been sent to your new primary email. Check your inbox.';
        } else if (verifyLink) {
            message = `Secondary email updated! A secure verification email has been sent.`;
        }

        return { success: true, message };
    } catch (err: any) {
        return { error: err?.response?.message || 'Failed to update emails. Are they already in use?' };
    }
}

// Client-side actions for toggles
export async function toggleUserNotification(setting: 'marketingEmails' | 'billingEmails' | 'accountSettingsEmails' | 'serviceStatusEmails', value: boolean) {
    const { pb, error } = await getPb();
    if (error || !pb) return { error };

    try {
        await pb.collection('users').authRefresh();
        const userId = pb.authStore.model?.id;
        if (!userId) return { error: 'Invalid user session.' };

        await pb.collection('users').update(userId, { [setting]: value });
        return { success: true };
    } catch (err: any) {
        console.error('Failed to update notification', err);
        return { error: 'Failed to update notification preferences. Does this field exist in PocketBase?' };
    }
}

export async function updateLanguage(language: string) {
    const { pb, error } = await getPb();
    if (error || !pb) return { error };

    try {
        await pb.collection('users').authRefresh();
        const userId = pb.authStore.model?.id;
        if (!userId) return { error: 'Invalid user session.' };

        await pb.collection('users').update(userId, { language });
        return { success: true };
    } catch (err: any) {
        return { error: 'Failed to update language. Does this field exist in PocketBase?' };
    }
}

export async function updatePreference(key: 'currency' | 'theme', value: string) {
    const { pb, error } = await getPb();
    if (error || !pb) return { error };

    try {
        await pb.collection('users').authRefresh();
        const userId = pb.authStore.model?.id;
        if (!userId) return { error: 'Invalid user session.' };

        await pb.collection('users').update(userId, { [key]: value });
        return { success: true };
    } catch (err: any) {
        return { error: `Failed to update ${key}. Does this field exist in PocketBase?` };
    }
}
