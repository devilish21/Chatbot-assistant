
import fetch from 'node-fetch';

async function testMetrics() {
    try {
        console.log("Testing /admin/stats/golden...");
        const res = await fetch('http://localhost:3000/admin/stats/golden');
        if (!res.ok) {
            console.error("API Error:", res.status, res.statusText);
            const text = await res.text();
            console.error("Body:", text);
            return;
        }
        const data = await res.json();
        console.log("Success! Data:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

testMetrics();
