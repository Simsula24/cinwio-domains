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
            <div style={{ position: 'absolute', top: '1.5rem', right: '2rem', zIndex: 1200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Logged in as <strong style={{ color: 'white' }}>{user?.email}</strong>
                    </span>
                    <form action={logout}>
                        <button type="submit" className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                            Logout
                        </button>
                    </form>
                </div>
            </div>
            {children}
        </>
    );
}
