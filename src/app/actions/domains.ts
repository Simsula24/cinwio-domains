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

        let nameComData: any = null;

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

        // Fetch from Pocketbase domain_contacts as a priority failsafe
        try {
            const pbContact = await pb.collection('domain_contacts').getFirstListItem(`domainName = "${domainName}"`);
            if (pbContact) {
                if (!nameComData) nameComData = {}; // Initialize if it was null from name.com failure

                // Override contacts with PB data
                nameComData.contacts = {
                    registrant: {
                        firstName: pbContact.firstName || '',
                        lastName: pbContact.lastName || '',
                        email: pbContact.email || '',
                        country: pbContact.country || ''
                    }
                };
            }
        } catch (e) {
            // Record not found or collection doesn't exist yet, simply ignore and continue
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

        // Save to Pocketbase
        try {
            let pbContact = null;
            try {
                pbContact = await pb.collection('domain_contacts').getFirstListItem(`domainName = "${domainName}"`);
            } catch (e) { }

            const contactData = {
                domainName: domainName,
                firstName: contacts.registrant?.firstName || '',
                lastName: contacts.registrant?.lastName || '',
                email: contacts.registrant?.email || '',
                country: contacts.registrant?.country || ''
            };

            if (pbContact) {
                await pb.collection('domain_contacts').update(pbContact.id, contactData);
            } else {
                await pb.collection('domain_contacts').create(contactData);
            }
        } catch (e) {
            console.error('Failed to save to domain_contacts', e);
        }

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
            // Don't fail completely if Name.com fails (e.g., domain isn't on Name.com yet)
            // Just return success so the frontend knows PB saved it
            return { success: true, warning: 'Saved locally, but failed to sync to Name.com.' };
        }

        return { success: true };
    } catch (err: any) {
        console.error('Failed to update contacts', err);
        return { error: 'An unexpected error occurred.' };
    }
}

export async function transferDomain(domainName: string, authCode: string) {
    const cookieStore = await cookies();
    const pbAuth = cookieStore.get('pb_auth')?.value;
    if (!pbAuth) return { error: 'Not authenticated' };

    const pb = new PocketBase(pbUrl);
    pb.authStore.save(pbAuth, null);
    if (!pb.authStore.isValid) return { error: 'Not authenticated' };

    try {
        await pb.collection('users').authRefresh();

        if (!NAMECOM_API_USERNAME || !NAMECOM_API_TOKEN) {
            return { error: 'Name.com API credentials are not configured properly.' };
        }

        const authString = Buffer.from(`${NAMECOM_API_USERNAME}:${NAMECOM_API_TOKEN}`).toString('base64');
        const response = await fetch(`${NAMECOM_API_URL}/v4/transfers`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                domainName,
                authCode
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Name.com API Error:', errorText);

            let errorMsg = 'Failed to initiate domain transfer.';
            try {
                const parsed = JSON.parse(errorText);
                if (parsed.message) errorMsg = parsed.message;
            } catch (e) { }

            return { error: errorMsg };
        }

        // Create a pending domain entry in PocketBase
        await pb.collection('domains').create({
            domainName: domainName,
            user: pb.authStore.model?.id,
            status: 'transferring',
            autorenew: false
        });

        return { success: true };
    } catch (err: any) {
        console.error('Failed to transfer domain', err);
        return { error: 'An unexpected error occurred during transfer.' };
    }
}

export async function getTransferPricing(domainName: string) {
    if (!NAMECOM_API_USERNAME || !NAMECOM_API_TOKEN) {
        return { error: 'Name.com API credentials are not configured properly.' };
    }

    const authString = Buffer.from(`${NAMECOM_API_USERNAME}:${NAMECOM_API_TOKEN}`).toString('base64');

    try {
        // v4 API check availability returns transfer and renewal prices if applicable
        const response = await fetch(`${NAMECOM_API_URL}/v4/domains/${domainName}:getPricing`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${authString}`
            }
        });

        if (!response.ok) {
            // Fallback to checkAvailability if getPricing is not directly supported this way
            const availResponse = await fetch(`${NAMECOM_API_URL}/v4/domains:checkAvailability`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${authString}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    domainNames: [domainName]
                })
            });

            if (availResponse.ok) {
                const availData = await availResponse.json();
                if (availData.results && availData.results.length > 0) {
                    const domainInfo = availData.results[0];
                    return {
                        transferPrice: domainInfo.transferPrice || domainInfo.purchasePrice || 0,
                        renewalPrice: domainInfo.renewalPrice || 0
                    };
                }
            }

            return { error: 'Failed to fetch pricing information.' };
        }

        const data = await response.json();
        return {
            transferPrice: data.transferPrice || data.purchasePrice || 0,
            renewalPrice: data.renewalPrice || 0
        };
    } catch (err) {
        console.error('Failed to get pricing', err);
        return { error: 'An unexpected error occurred while fetching pricing.' };
    }
}
