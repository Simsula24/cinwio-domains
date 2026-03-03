"use server";

import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';

const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://domaindb.cinwio.com/';

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
        // We will "pretend" to trigger verification for it as requested by returning a message
        if (user.secondaryEmail !== secondaryEmail) {
            await pb.collection('users').update(user.id, { secondaryEmail });
        }

        // 2. Changing the primary email in PocketBase requires a special endpoint
        let message = 'Emails updated successfully.';
        if (user.email !== email && email) {
            await pb.collection('users').requestEmailChange(email);
            message = 'A verification link has been sent to your new primary email. Secondary email updated if changed.';
        } else if (user.secondaryEmail !== secondaryEmail && secondaryEmail) {
            message = 'Secondary email updated and verification triggered (mocked).';
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
