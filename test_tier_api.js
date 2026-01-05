
fetch('http://localhost:3002/api/games')
    .then(res => res.json())
    .then(games => {
        if (games.length === 0) {
            console.log("No games found to test.");
            return;
        }
        const gameId = games[0].id;
        console.log("Testing with game ID:", gameId);

        return fetch(`http://localhost:3002/api/admin/games/${gameId}/tiers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                label: "Test Tier",
                price_gold: 10,
                duration_minutes: 30
            })
        });
    })
    .then(res => {
        if (!res) return;
        console.log("Status:", res.status);
        return res.json();
    })
    .then(data => {
        console.log("Response:", data);
    })
    .catch(err => console.error("Error:", err));
