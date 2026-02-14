// Test script to simulate what ProductGridSection does
async function testProductDisplay() {
    console.log('🧪 Testing Product Grid Section Logic...\n');

    const categories = ['women', 'men', 'kids'];

    for (const title of categories) {
        const categoryParam = title.toLowerCase();
        console.log(`\n📦 Testing category: ${title.toUpperCase()}`);

        try {
            const response = await fetch(`http://localhost:3000/api/products?limit=6&category=${categoryParam}`);
            const result = await response.json();
            const data = Array.isArray(result) ? result : (result.items || []);

            console.log(`   API Response Status: ${response.status}`);
            console.log(`   Products Found: ${data.length}`);

            if (data.length > 0) {
                const firstProduct = data[0];
                console.log(`   \n   Sample Product Structure:`);
                console.log(`   - ID: ${firstProduct.id}`);
                console.log(`   - Name: ${firstProduct.name}`);
                console.log(`   - Price: ${firstProduct.price}`);
                console.log(`   - Category: ${firstProduct.category}`);
                console.log(`   - Images: ${firstProduct.images?.length || 0}`);
                console.log(`   - First Image URL: ${firstProduct.images?.[0]?.url || 'NONE'}`);
                console.log(`   - isActive: ${firstProduct.isActive}`);
                console.log(`   - hasPendingStyle: ${firstProduct.hasPendingStyle}`);

                // Simulate ProductGridSection transformation
                const displayProduct = {
                    id: firstProduct.id,
                    image: firstProduct.images?.[0]?.url || "/images/placeholder.png",
                    images: firstProduct.images || [],
                    title: firstProduct.name,
                    description: firstProduct.description || "Premium quality product",
                    price: `$${firstProduct.price.toFixed(2)}`,
                    originalPrice: firstProduct.comparePrice ? `$${firstProduct.comparePrice.toFixed(2)}` : "",
                    // daysAgo: formatDaysAgo(firstProduct.createdAt),
                    isWishlist: false,
                    createdAt: firstProduct.createdAt,
                    quantity: firstProduct.quantity,
                    isActive: firstProduct.isActive,
                    status: firstProduct.status,
                    category: firstProduct.category,
                    size: firstProduct.size,
                    vendorId: firstProduct.vendorId,
                    hasPendingStyle: firstProduct.hasPendingStyle,
                };

                console.log(`\n   ✅ Display Product Created:`);
                console.log(`   - Title: ${displayProduct.title}`);
                console.log(`   - Image: ${displayProduct.image}`);
                console.log(`   - Price: ${displayProduct.price}`);
            } else {
                console.log(`   ⚠️  No products found for category: ${title}`);
            }
        } catch (error: any) {
            console.error(`   ❌ Error:`, error.message);
        }
    }
}

testProductDisplay();
