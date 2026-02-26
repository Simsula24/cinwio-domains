"use server";

import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';

const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://domaindb.cinwio.com/';

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';
const BASE_URL = 'https://api.cloudflare.com/client/v4';

async function fetchCf(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Authorization': `Bearer ${CF_API_TOKEN}`,
            'Content-Type': 'application/json',
            ...options.headers,
        }
    });
    return response.json();
}

async function verifyDomainOwnership(domainName: string) {
    const cookieStore = await cookies();
    const pbAuth = cookieStore.get('pb_auth')?.value;

    if (!pbAuth) {
        return { error: 'Not authenticated' };
    }

    const pb = new PocketBase(pbUrl);
    pb.authStore.save(pbAuth, null);

    if (!pb.authStore.isValid) {
        return { error: 'Not authenticated' };
    }

    try {
        await pb.collection('users').authRefresh();
        const domains = await pb.collection('domains').getFullList({
            filter: `user = "${pb.authStore.model?.id}" && domainName = "${domainName}"`,
        });

        if (domains.length === 0) {
            return { error: 'Domain not found or unauthorized' };
        }

        return { success: true, user: pb.authStore.model };
    } catch (err: any) {
        console.error('Failed to verify domain ownership', err);
        return { error: 'Server error verifying domain' };
    }
}

type ZoneResponse = { error?: string; zoneId?: string };

export async function getOrCreateZone(domainName: string): Promise<ZoneResponse> {
    const authCheck = await verifyDomainOwnership(domainName);
    if (authCheck.error) return { error: authCheck.error };

    // 1. Check if zone exists
    const zonesData = await fetchCf(`/zones?name=${domainName}`);
    if (!zonesData.success) {
        return { error: 'Failed to query Cloudflare zones' };
    }

    if (zonesData.result.length > 0) {
        return { zoneId: zonesData.result[0].id };
    }

    // 2. Create zone if it doesn't exist
    const createData = await fetchCf('/zones', {
        method: 'POST',
        body: JSON.stringify({
            name: domainName,
            account: { id: CF_ACCOUNT_ID },
            jump_start: false
        })
    });

    if (!createData.success) {
        console.error('Cloudflare Zone Creation Error:', createData.errors);
        return { error: 'Failed to create Cloudflare zone. ' + (createData.errors[0]?.message || '') };
    }

    return { zoneId: createData.result.id };
}

type RecordsResponse = { error?: string; records?: any[] };

export async function getDnsRecords(domainName: string): Promise<RecordsResponse> {
    const zoneRes = await getOrCreateZone(domainName);
    if (zoneRes.error) return { error: zoneRes.error };

    const recordsData = await fetchCf(`/zones/${zoneRes.zoneId}/dns_records`);
    if (!recordsData.success) {
        return { error: 'Failed to fetch DNS records' };
    }

    return { records: recordsData.result };
}

type CreateRecordResponse = { error?: string; success?: boolean; record?: any };

export async function createDnsRecord(domainName: string, data: { type: string, name: string, content: string, proxied: boolean, ttl: number }): Promise<CreateRecordResponse> {
    const zoneRes = await getOrCreateZone(domainName);
    if (zoneRes.error) return { error: zoneRes.error };

    const createData = await fetchCf(`/zones/${zoneRes.zoneId}/dns_records`, {
        method: 'POST',
        body: JSON.stringify(data)
    });

    if (!createData.success) {
        return { error: 'Failed to create DNS record. ' + (createData.errors[0]?.message || '') };
    }

    return { success: true, record: createData.result };
}

type DeleteRecordResponse = { error?: string; success?: boolean };

export async function deleteDnsRecord(domainName: string, recordId: string): Promise<DeleteRecordResponse> {
    const zoneRes = await getOrCreateZone(domainName);
    if (zoneRes.error) return { error: zoneRes.error };

    const deleteData = await fetchCf(`/zones/${zoneRes.zoneId}/dns_records/${recordId}`, {
        method: 'DELETE'
    });

    if (!deleteData.success) {
        return { error: 'Failed to delete DNS record. ' + (deleteData.errors[0]?.message || '') };
    }

    return { success: true };
}
