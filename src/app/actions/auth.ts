"use server";

import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://domaindb.cinwio.com/';

export async function login(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Email and password are required' };
    }

    const pb = new PocketBase(pbUrl);

    try {
        await pb.collection('users').authWithPassword(email, password);
        const cookieStore = await cookies();
        cookieStore.set('pb_auth', pb.authStore.token, {
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 1 week
        });
    } catch (err: any) {
        return { error: 'Invalid email or password.' };
    }

    redirect('/domains');
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

        // Auto login after successful registration
        await pb.collection('users').authWithPassword(email, password);
        const cookieStore = await cookies();
        cookieStore.set('pb_auth', pb.authStore.token, {
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 1 week
        });
    } catch (err: any) {
        // Return PocketBase validation errors or generic error
        return { error: err?.response?.message || 'Failed to register account.' };
    }

    redirect('/domains');
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('pb_auth');
    redirect('/login');
}
