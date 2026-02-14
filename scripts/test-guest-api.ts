// Test script to check what the API actually returns
const testCategories = ['women', 'men', 'kids'];

async function testAPI() {
    console.log('🧪 Testing Product API Endpoints...\n');

    for (const category of testCategories) {
        try {
            const response = await fetch(`http://localhost:3000/api/products?limit=6&category=${category}`);
            const data = await response.json();

            console.log(`📦 Category: ${category.toUpperCase()}`);
            console.log(`   Status: ${response.status}`);
            console.log(`   Results: ${data.items?.length || 0} products`);

            if (data.items && data.items.length > 0) {
                console.log(`   Sample: ${data.items[0].name} (Category: ${data.items[0].category})`);
            }
            console.log('');
        } catch (error: any) {
            console.error(`   ❌ Error for ${category}:`, error.message);
        }
    }

    // Test bestselling styles
    console.log('🎨 Testing Bestselling Styles API...\n');
    try {
        const response = await fetch('http://localhost:3000/api/analytics/bestselling-styles');
        const data = await response.json();

        console.log(`   Status: ${response.status}`);
        console.log(`   Results: ${data.length || 0} styles`);

        if (data.length > 0) {
            data.forEach((style: any, idx: number) => {
                console.log(`   ${idx + 1}. ${style.name} (Sold: ${style.totalSold})`);
            });
        }
    } catch (error: any) {
        console.error(`   ❌ Error:`, error.message);
    }
}

testAPI();
