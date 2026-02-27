"use server";

import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';

const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://domaindb.cinwio.com/';

const isProduction = process.env.NODE_ENV === 'production';

const NAMECOM_API_URL = isProduction
    ? (process.env.NAMECOM_PRODUCTION_PRODUCTION_API_URL || 'https://api.name.com')
    : (process.env.NAMECOM_TEST_API_URL || 'https://api.dev.name.com');

const NAMECOM_API_USERNAME = isProduction
    ? (process.env.NAMECOM_PRODUCTION_USERNAME || '')
    : (process.env.NAMECOM_TEST_USERNAME || '');

const NAMECOM_API_TOKEN = isProduction
    ? (process.env.NAMECOM_PRODUCTION_API_TOKEN || '')
    : (process.env.NAMECOM_TEST_API_TOKEN || '');

export type DomainSearchResult = {
    domainName: string;
    purchasable: boolean;
    purchasePrice?: number;
    purchaseType?: string;
    renewalPrice?: number;
};

export async function searchDomain(keyword: string): Promise<{ results?: DomainSearchResult[], error?: string }> {
    if (!keyword) {
        return { error: 'Please enter a domain name.' };
    }

    if (!NAMECOM_API_USERNAME || !NAMECOM_API_TOKEN) {
        return { error: 'Name.com API credentials are not configured properly.' };
    }

    // Name.com requires basic auth
    const authString = Buffer.from(`${NAMECOM_API_USERNAME}:${NAMECOM_API_TOKEN}`).toString('base64');

    try {
        // Name.com Search endpoint: POST /v4/domains:checkAvailability
        // Allows checking multiple domains or doing a keyword search 
        // We'll construct a checkAvailability request for the exact keyword

        // Also it's useful to do a standard domain search POST /v4/domains:search 
        // But Name.com dev API search endpoint allows passing a keyword to find suggestions.

        // Let's use search API to get suggestions and the exact match
        const response = await fetch(`${NAMECOM_API_URL}/v4/domains:search`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                keyword: keyword,
                timeout: 5000 // In milliseconds max
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Name.com API Error:', errorText);
            return { error: 'Failed to communicate with the Name.com API. Please check your credentials.' };
        }

        const data = await response.json();

        // Name.com omits the 'purchasable' property entirely when a domain is taken/unavailable!
        // We MUST map the results to explicitly inject `purchasable: false` when it's missing.
        const results = (data.results as any[] || []).map(result => ({
            ...result,
            purchasable: !!result.purchasable // strictly casts undefined to false
        })) as DomainSearchResult[];

        if (!results || results.length === 0) {
            return { error: 'No domains found for this keyword.' };
        }

        return { results };

    } catch (err: any) {
        console.error('Domain search error:', err);
        return { error: 'An unexpected error occurred while searching for domains.' };
    }
}

export async function getUserDomains() {
    const cookieStore = await cookies();
    const pbAuth = cookieStore.get('pb_auth')?.value;

    if (!pbAuth) {
        return { domains: [], error: 'Not authenticated' };
    }

    const pb = new PocketBase(pbUrl);
    pb.authStore.save(pbAuth, null);

    if (!pb.authStore.isValid) {
        return { domains: [], error: 'Not authenticated' };
    }

    try {
        await pb.collection('users').authRefresh();

        const domains = await pb.collection('domains').getFullList({
            filter: `user = "${pb.authStore.model?.id}"`,
            sort: '-created'
        });
        return { domains: JSON.parse(JSON.stringify(domains)) };
    } catch (err: any) {
        console.error('Failed to get user domains', err);
        return { domains: [], error: 'Failed to fetch your domains.' };
    }
}

export async function getDomainDetails(domainName: string) {
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

        const dbDomain = domains[0];

        let nameComData = null;

        // Try to fetch from name.com API
        if (NAMECOM_API_USERNAME && NAMECOM_API_TOKEN) {
            const authString = Buffer.from(`${NAMECOM_API_USERNAME}:${NAMECOM_API_TOKEN}`).toString('base64');
            const response = await fetch(`${NAMECOM_API_URL}/v4/domains/${domainName}`, {
                headers: {
                    'Authorization': `Basic ${authString}`
                }
            });
            if (response.ok) {
                nameComData = await response.json();
            }
        }

        return {
            dbDomain: JSON.parse(JSON.stringify(dbDomain)),
            nameComData
        };
    } catch (err: any) {
        console.error('Failed to get domain details', err);
        return { error: 'Failed to fetch domain details.' };
    }
}

export async function toggleDomainAutorenew(domainId: string, currentState: boolean) {
    const cookieStore = await cookies();
    const pbAuth = cookieStore.get('pb_auth')?.value;

    if (!pbAuth) return { error: 'Not authenticated' };

    const pb = new PocketBase(pbUrl);
    pb.authStore.save(pbAuth, null);

    if (!pb.authStore.isValid) return { error: 'Not authenticated' };

    try {
        await pb.collection('users').authRefresh();

        // We assume you have added a boolean 'autorenew' field to domains collection
        // If not, please add it! PocketBase will just ignore it if it doesn't exist but we try to update.
        await pb.collection('domains').update(domainId, { autorenew: !currentState });
        return { success: true };
    } catch (err: any) {
        console.error('Failed to toggle autorenew', err);
        return { error: 'Failed to update auto-renewal status.' };
    }
}

export async function updateDomainNameservers(domainName: string, nameservers: string[]) {
    const cookieStore = await cookies();
    const pbAuth = cookieStore.get('pb_auth')?.value;
    if (!pbAuth) return { error: 'Not authenticated' };

    const pb = new PocketBase(pbUrl);
    pb.authStore.save(pbAuth, null);
    if (!pb.authStore.isValid) return { error: 'Not authenticated' };

    try {
        await pb.collection('users').authRefresh();
        const domains = await pb.collection('domains').getFullList({
            filter: `user = "${pb.authStore.model?.id}" && domainName = "${domainName}"`,
        });

        if (domains.length === 0) return { error: 'Domain not found or unauthorized' };

        if (!NAMECOM_API_USERNAME || !NAMECOM_API_TOKEN) {
            return { error: 'Name.com API credentials are not configured properly.' };
        }

        const authString = Buffer.from(`${NAMECOM_API_USERNAME}:${NAMECOM_API_TOKEN}`).toString('base64');
        const response = await fetch(`${NAMECOM_API_URL}/v4/domains/${domainName}:setNameservers`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nameservers })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Name.com API Error:', errorText);
            return { error: 'Failed to update Name.com nameservers.' };
        }

        return { success: true };
    } catch (err: any) {
        console.error('Failed to update nameservers', err);
        return { error: 'An unexpected error occurred.' };
    }
}

export async function updateDomainContacts(domainName: string, contacts: any) {
    const cookieStore = await cookies();
    const pbAuth = cookieStore.get('pb_auth')?.value;
    if (!pbAuth) return { error: 'Not authenticated' };

    const pb = new PocketBase(pbUrl);
    pb.authStore.save(pbAuth, null);
    if (!pb.authStore.isValid) return { error: 'Not authenticated' };

    try {
        await pb.collection('users').authRefresh();
        const domains = await pb.collection('domains').getFullList({
            filter: `user = "${pb.authStore.model?.id}" && domainName = "${domainName}"`,
        });

        if (domains.length === 0) return { error: 'Domain not found or unauthorized' };

        if (!NAMECOM_API_USERNAME || !NAMECOM_API_TOKEN) {
            return { error: 'Name.com API credentials are not configured properly.' };
        }

        const authString = Buffer.from(`${NAMECOM_API_USERNAME}:${NAMECOM_API_TOKEN}`).toString('base64');
        const response = await fetch(`${NAMECOM_API_URL}/v4/domains/${domainName}:setContacts`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contacts })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Name.com API Error:', errorText);
            return { error: 'Failed to update Name.com contact information.' };
        }

        return { success: true };
    } catch (err: any) {
        console.error('Failed to update contacts', err);
        return { error: 'An unexpected error occurred.' };
    }
}
