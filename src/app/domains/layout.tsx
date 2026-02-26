import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import PocketBase from 'pocketbase';
import React from 'react';
import { logout } from '../actions/auth';

export default async function DomainsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const pbAuth = cookieStore.get('pb_auth')?.value;

    if (!pbAuth) {
        redirect('/login');
    }

    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://domaindb.cinwio.com/');
    pb.authStore.save(pbAuth, null);

    if (!pb.authStore.isValid) {
        redirect('/login');
    }

    // Verify the token by refreshing it
    try {
        await pb.collection('users').authRefresh();
    } catch (err) {
        redirect('/login');
    }

    const user = pb.authStore.model;

    return (
        <>
            {children}
        </>
    );
}
