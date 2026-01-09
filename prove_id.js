function generateId(account) {
    let numId = 0;
    for (let i = 0; i < account.length; i++) {
        numId = ((numId << 5) - numId) + account.charCodeAt(i);
        numId |= 0; // Convert to 32bit int
    }
    return Math.abs(numId) % 1000000 + 10000;
}

const account = "1767510687482";
const generatedId = generateId(account);
const name = "Hunter_" + account.substring(0, 5);

console.log(`Input Account (Timestamp): "${account}"`);
console.log(`Generated Name: "${name}"`);
console.log(`Generated ID: ${generatedId}`);
console.log(`Matches 752822? ${generatedId === 752822 ? "YES" : "NO"}`);
