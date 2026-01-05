const fs = require('fs');

const postMessageCode = `
      try {
          if (this.score > 0) {
              window.parent.postMessage({ type: 'GAME_OVER', score: this.score }, '*');
              console.log("Posted score:", this.score);
          }
      } catch(e) { console.error('Score post failed', e); }
`;

try {
    const filePath = 'e:/Steam/gamezoe/games/DuckHunt-JS-master/dist/duckhunt.js';
    let content = fs.readFileSync(filePath, 'utf8');

    // Safety check: remove previous fetch injection if it exists (or failed partials)
    // We search for unique markers.
    // Actually, since I reverted the file by "fix_encoding", it might still have the OLD injection?
    // Wait, "fix_encoding" converted UTF16->UTF8. It didn't REMOVE the injected code.
    // So the corrupted file DID contain the injection, just in wrong encoding.
    // Now that it's UTF8, it contains the `fetch` code.
    // I should REPLACE the `fetch` code with `postMessage` code.

    const oldFetchStart = "try {";
    const oldFetchEnd = "catch(e) { console.error('Score submit failed', e); }";

    // Simple regex to remove the old try-catch block I added
    // It was: try { var urlParams ... } catch(e) ...
    // I will regex replace it or just look for the specific string I added.

    const oldCodePattern = /try\s*{\s*var urlParams[\s\S]*?console\.error\('Score submit failed', e\);\s*}/g;

    if (oldCodePattern.test(content)) {
        console.log("Found old fetch code, removing it...");
        content = content.replace(oldCodePattern, '');
    }

    // Now inject new postMessage code
    // Inject into win()
    const winStr = "this.gameStatus = '你贏了!';";
    if (content.indexOf(winStr) !== -1) {
        // Avoid double injection if I run this script multiple times
        if (content.indexOf("window.parent.postMessage") === -1 || content.indexOf(winStr + postMessageCode) === -1) {
            content = content.replace(winStr, winStr + postMessageCode);
            console.log("Injected postMessage into win()");
        }
    } else {
        console.log("Win string not found");
        // Fallback to English if localized string missing?
        const winEng = "this.gameStatus = 'You Win!';"; // unlikely since I saw chinese
    }

    // Inject into loss()
    const lossStr = "this.gameStatus = '你輸了!';";
    if (content.indexOf(lossStr) !== -1) {
        if (content.indexOf("window.parent.postMessage") === -1 || content.indexOf(lossStr + postMessageCode) === -1) {
            content = content.replace(lossStr, lossStr + postMessageCode);
            console.log("Injected postMessage into loss()");
        }
    } else {
        console.log("Loss string not found");
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log("duckhunt.js updated with postMessage.");

} catch (err) {
    console.error(err);
}
