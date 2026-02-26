"use server";

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
        const results = data.results as DomainSearchResult[];

        if (!results || results.length === 0) {
            return { error: 'No domains found for this keyword.' };
        }

        return { results };

    } catch (err: any) {
        console.error('Domain search error:', err);
        return { error: 'An unexpected error occurred while searching for domains.' };
    }
}
