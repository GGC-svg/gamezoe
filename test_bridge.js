import fetch from 'node-fetch'; // Requires node-fetch v3 or native fetch in Node 18+

async function testBridge() {
    const API_KEY = "gamezoe-secure-bridge-key";
    const BASE_URL = "http://localhost:3001/api/bridge";

    console.log("1. Testing Get Balance...");
    try {
        // Using a ID that definitely doesn't exist to test 404/Auth
        const res = await fetch(`${BASE_URL}/balance/test_user_exists_or_not`, {
            headers: { 'x-api-key': API_KEY }
        });
        const data = await res.json();
        console.log(`Balance Response: ${res.status}`);
        // We expect 404 (User not found) OR 401 (Auth failed)
        // If 404, it means Auth PASSED and it queries DB. Good.
    } catch (e) {
        console.error("Balance Error:", e.message);
    }
}

testBridge();
