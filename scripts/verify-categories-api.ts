
async function main() {
    console.log('Fetching /api/categories...');
    const startTime = performance.now();
    const res = await fetch('http://localhost:3000/api/categories');
    const endTime = performance.now();

    console.log(`Status: ${res.status}`);
    console.log(`Time: ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`Cache-Control: ${res.headers.get('cache-control')}`);

    const data = await res.json();
    console.log(`Categories count: ${Array.isArray(data) ? data.length : 'Not an array'}`);
}

main();
