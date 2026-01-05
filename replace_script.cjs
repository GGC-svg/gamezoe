const fs = require('fs');

const fetchCode = `
      try {
          var urlParams = new URL(window.location.href).searchParams;
          var userId = urlParams.get('userId');
          var gameId = urlParams.get('gameId');
          if (userId && this.score > 0) {
              fetch('/api/games/' + (gameId || 'game_duck_hunt') + '/score', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: userId, score: this.score })
              });
          }
      } catch(e) { console.error('Score submit failed', e); }
`;

try {
    let content = fs.readFileSync('e:/Steam/gamezoe/temp_duckhunt.js', 'utf8');

    // Inject into win()
    const winStr = "this.gameStatus = '你贏了!';";
    if (content.indexOf(winStr) !== -1) {
        content = content.replace(winStr, winStr + fetchCode);
        console.log("Injected into win()");
    } else {
        console.log("Win string not found");
    }

    // Inject into loss()
    const lossStr = "this.gameStatus = '你輸了!';";
    if (content.indexOf(lossStr) !== -1) {
        content = content.replace(lossStr, lossStr + fetchCode);
        console.log("Injected into loss()");
    } else {
        console.log("Loss string not found");
    }

    fs.writeFileSync('e:/Steam/gamezoe/temp_duckhunt.js', content, 'utf8');
    console.log("File updated");

} catch (err) {
    console.error(err);
}
