
import crypto from 'crypto';

const SECRET_KEY = "gamezoe-secure-bridge-key"; // Should be env var in production

export function generateSignature(payload) {
    // Sort keys to ensure consistent JSON stringification could be hard, 
    // so we document that we sign specific fields: order_id + user_id + amount + timestamp
    const raw = `${payload.order_id}${payload.user_id}${payload.amount}${payload.timestamp}`;
    return crypto.createHmac('sha256', SECRET_KEY).update(raw).digest('hex');
}

export function verifySignature(payload, receivedSignature) {
    const expected = generateSignature(payload);
    return expected === receivedSignature;
}
