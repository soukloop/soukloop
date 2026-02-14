
async function main() {
    const BASE_URL = 'http://localhost:3000/api';
    let savedSearchId = '';

    console.log('Testing Saved Searches API...');

    // Helper to fetch with better error handling
    async function safeFetch(url: string, options: RequestInit = {}) {
        try {
            const res = await fetch(url, { ...options, redirect: 'manual' });
            console.log(`Status: ${res.status}`);

            if (res.status === 307 || res.status === 302 || res.status === 401) {
                console.log('Authentication required (Expected for unauthenticated script)');
                return null;
            }

            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await res.json();
            } else {
                console.log('Response is not JSON:', await res.text().then(t => t.substring(0, 100) + '...'));
                return null;
            }
        } catch (e) {
            console.error('Fetch error:', e);
            return null;
        }
    }

    // 1. POST Create
    console.log('\nPOST /saved-searches');
    const createData = await safeFetch(`${BASE_URL}/saved-searches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: 'API Test Query',
            filters: { category: 'Test Category' }
        })
    });

    if (createData) {
        savedSearchId = createData.id;
        console.log('Created Saved Search:', JSON.stringify(createData, null, 2));
    }

    // 2. GET List
    console.log('\nGET /saved-searches');
    const listData = await safeFetch(`${BASE_URL}/saved-searches`);
    if (listData) {
        console.log('Saved Searches List:', JSON.stringify(listData, null, 2));
    }

    // 3. DELETE
    if (savedSearchId) {
        console.log(`\nDELETE /saved-searches/${savedSearchId}`);
        await safeFetch(`${BASE_URL}/saved-searches/${savedSearchId}`, {
            method: 'DELETE'
        });
    } else {
        console.log('\nSkipping DELETE test (no ID created)');
    }
}
