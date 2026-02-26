"use server";

import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://domaindb.cinwio.com/';

export async function checkAdmin() {
    const cookieStore = await cookies();
    const pbAuth = cookieStore.get('pb_auth')?.value;

    if (!pbAuth) {
        redirect('/login');
    }

    const pb = new PocketBase(pbUrl);
    pb.authStore.save(pbAuth, null);

    if (!pb.authStore.isValid) {
        redirect('/login');
    }

    try {
        await pb.collection('users').authRefresh();
        const user = pb.authStore.model;

        // We assume an 'isAdmin' or 'role' field exists.
        // If not, you might need to update your PocketBase schema to include 'role'='admin'
        if (user?.role !== 'admin' && user?.role !== 'master') {
            redirect('/domains'); // Throw them out to normal dashboard
        }

        return { pb, user };
    } catch (err) {
        redirect('/login');
    }
}

export async function getUsers() {
    const { pb } = await checkAdmin();
    try {
        const users = await pb.collection('users').getFullList({
            sort: '-created',
        });
        return { users: JSON.parse(JSON.stringify(users)) };
    } catch (err: any) {
        console.error('Failed to get users', err);
        return { error: 'Failed to fetch users. Make sure your PocketBase API rules allow admins to list users.' };
    }
}

export async function updateUserRole(userId: string, role: string) {
    const { pb } = await checkAdmin();
    try {
        await pb.collection('users').update(userId, { role });
        return { success: true };
    } catch (err: any) {
        console.error('Failed to update role', err);
        return { error: 'Failed to update user role.' };
    }
}

export async function deleteUser(userId: string) {
    const { pb } = await checkAdmin();
    try {
        await pb.collection('users').delete(userId);
        return { success: true };
    } catch (err: any) {
        console.error('Failed to delete user', err);
        return { error: 'Failed to delete user.' };
    }
}

export async function getDomains() {
    const { pb } = await checkAdmin();
    try {
        const domains = await pb.collection('domains').getFullList({
            sort: '-created',
            expand: 'user'
        });
        return { domains: JSON.parse(JSON.stringify(domains)) };
    } catch (err: any) {
        console.error('Failed to get domains', err);
        return { error: 'Failed to fetch domains. Make sure the domains collection exists and API rules allow admins to list them.' };
    }
}

export async function assignDomainToUser(domainId: string, userId: string) {
    const { pb } = await checkAdmin();
    try {
        await pb.collection('domains').update(domainId, { user: userId });
        return { success: true };
    } catch (err: any) {
        console.error('Failed to assign domain', err);
        return { error: 'Failed to assign domain to user.' };
    }
}

export async function createDomainRecord(domainName: string, userId: string) {
    const { pb } = await checkAdmin();
    try {
        await pb.collection('domains').create({
            domainName,
            user: userId,
            status: 'active'
        });
        return { success: true };
    } catch (err: any) {
        console.error('Failed to create domain', err);
        return { error: 'Failed to create domain record.' };
    }
}
