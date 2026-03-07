"use server";

import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://domaindb.cinwio.com/';

export async function login(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const redirectTo = formData.get('redirectTo') as string;

    if (!email || !password) {
        return { error: 'Email and password are required' };
    }

    const pb = new PocketBase(pbUrl);

    try {
        const authData = await pb.collection('users').authWithPassword(email, password);

        if (!authData.record.verified) {
            pb.authStore.clear();
            return { error: 'Please verify your email address before logging in.' };
        }

        const cookieStore = await cookies();
        cookieStore.set('pb_auth', pb.authStore.token, {
            path: '/',
            secure: process.env.NODE_ENV === 'production' && process.env.SECURE_COOKIES !== 'false',
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 1 week
        });
    } catch (err: any) {
        return { error: 'Invalid email or password.' };
    }

    if (redirectTo && redirectTo.startsWith('/')) {
        redirect(redirectTo);
    } else {
        redirect('/domains');
    }
}

export async function register(prevState: any, formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const passwordConfirm = formData.get('passwordConfirm') as string;

    if (password !== passwordConfirm) {
        return { error: 'Passwords do not match' };
    }

    const pb = new PocketBase(pbUrl);

    try {
        await pb.collection('users').create({
            email,
            password,
            passwordConfirm,
            name,
        });

        // Send verification email
        await pb.collection('users').requestVerification(email);

        return { success: true, message: 'Please check your email for the verification link.', email };
    } catch (err: any) {
        // Return PocketBase validation errors or generic error
        return { error: err?.response?.message || 'Failed to register account. Email might already exist.' };
    }
}

export async function resendVerificationEmail(email: string) {
    if (!email) return { error: 'Email is required to resend verification' };

    const pb = new PocketBase(pbUrl);
    try {
        await pb.collection('users').requestVerification(email);
        return { success: true, message: 'Verification email resent successfully' };
    } catch (err: any) {
        return { error: 'Too many requests or user may already be verified.' };
    }
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('pb_auth');
    redirect('/login');
}

export async function requestPasswordReset(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;

    if (!email) {
        return { error: 'Email is required' };
    }

    const pb = new PocketBase(pbUrl);
    try {
        await pb.collection('users').requestPasswordReset(email);
        return { success: true, message: 'If an account with this email exists, a password reset link has been sent.' };
    } catch (err: any) {
        // Obscure actual existence of email for security
        return { success: true, message: 'If an account with this email exists, a password reset link has been sent.' };
    }
}

export async function confirmPasswordReset(prevState: any, formData: FormData) {
    const token = formData.get('token') as string;
    const password = formData.get('password') as string;
    const passwordConfirm = formData.get('passwordConfirm') as string;

    if (!token || !password || !passwordConfirm) {
        return { error: 'All fields are required.' };
    }

    if (password !== passwordConfirm) {
        return { error: 'Passwords do not match.' };
    }

    const pb = new PocketBase(pbUrl);
    try {
        await pb.collection('users').confirmPasswordReset(token, password, passwordConfirm);
        return { success: true, message: 'Password has been reset successfully.' };
    } catch (err: any) {
        return { error: 'Failed to reset password. The link may have expired or is invalid.' };
    }
}
