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

export async function confirmEmailChange(prevState: any, formData: FormData) {
    const { pb, error } = await getPb();
    if (error || !pb) return { error };

    const token = formData.get('token') as string;
    const password = formData.get('password') as string;

    if (!token || !password) {
        return { error: 'Token and your account password are required.' };
    }

    try {
        await pb.collection('users').confirmEmailChange(token, password);
        return { success: true };
    } catch (err: any) {
        return { error: err?.response?.message || 'Invalid token or incorrect password.' };
    }
}
