/**
 * P99PAY Payment Gateway Integration Module
 *
 * Implements TripleDES-CBC encryption and ERQC/ERPC verification
 * for P99 Payment System API integration.
 *
 * Reference: P99 線上金流系統介接整合說明書 V1.2.3
 */

import crypto from 'crypto';

// Default configuration (can be overridden via constructor or env)
const DEFAULT_CONFIG = {
    apiUrl: process.env.P99_API_URL || 'https://api.p99pay.com/v1',
    mid: process.env.P99_MID || '',
    cid: process.env.P99_CID || '',
    key: process.env.P99_KEY || '',
    iv: process.env.P99_IV || '',
    password: process.env.P99_PASSWORD || '',
    returnUrl: process.env.P99_RETURN_URL || '',
    notifyUrl: process.env.P99_NOTIFY_URL || ''
};

/**
 * P99PAY API Client
 */
export class P99PayClient {
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * Encrypt data using TripleDES-CBC
     * @param {string} data - Plain text to encrypt
     * @returns {string} BASE64 encoded encrypted data
     */
    encryptTripleDES(data) {
        const key = Buffer.from(this.config.key, 'base64');
        const iv = Buffer.from(this.config.iv, 'base64');

        // PKCS7 padding
        const blockSize = 8;
        const padLength = blockSize - (Buffer.byteLength(data, 'utf8') % blockSize);
        const paddedData = data + String.fromCharCode(padLength).repeat(padLength);

        const cipher = crypto.createCipheriv('des-ede3-cbc', key, iv);
        cipher.setAutoPadding(false);

        let encrypted = cipher.update(paddedData, 'utf8', 'base64');
        encrypted += cipher.final('base64');

        return encrypted;
    }

    /**
     * Format amount to 14 digits (12 integer + 2 decimal, no decimal point)
     * @param {number|string} amount - Amount value
     * @returns {string} 14-digit formatted amount
     */
    formatAmount(amount) {
        const amtStr = String(amount);

        if (amtStr.includes('.')) {
            const parts = amtStr.split('.');
            const intPart = parts[0].padStart(12, '0');
            const decPart = (parts[1] + '00').substring(0, 2);
            return intPart + decPart;
        } else {
            return amtStr.padStart(12, '0') + '00';
        }
    }

    /**
     * Generate ERQC (商家交易驗證資料壓碼)
     * Formula: ERQC DATA = CID + COID + CUID(3) + AMOUNT(14) + PASSWORD
     *
     * @param {Object} params - Transaction parameters
     * @param {string} params.coid - Order ID
     * @param {string} params.cuid - Currency (USD/TWD)
     * @param {number} params.amount - Transaction amount
     * @param {string} [params.paid] - Payment agent ID (optional for ERQC)
     * @param {string} [params.userAcctId] - User account ID (optional)
     * @returns {string} ERQC verification code
     */
    getERQC(params) {
        const { coid, cuid, amount, paid, userAcctId } = params;
        const formattedAmount = this.formatAmount(amount);

        // Build ERQC data string (PHP formula: CID + COID + CUID + PAID + AMOUNT(14) + USER_ACCTID + PWD)
        let erqcData = this.config.cid + coid + cuid + (paid || '') + formattedAmount + (userAcctId || '') + this.config.password;

        console.log('[P99Pay ERQC Debug] Input:', {
            cid: this.config.cid,
            coid,
            cuid,
            paid: paid || '',
            amount: formattedAmount,
            userAcctId: userAcctId || '',
            pwd: this.config.password ? '***' : 'MISSING'
        });
        console.log('[P99Pay ERQC Debug] Data string length:', erqcData.length);

        // Encrypt with 3DES
        const encryptedData = this.encryptTripleDES(erqcData);

        // SHA1 hash and BASE64 encode
        const sha1Hash = crypto.createHash('sha1').update(encryptedData).digest();
        const erqc = sha1Hash.toString('base64');

        console.log('[P99Pay ERQC Debug] Result:', erqc);
        return erqc;
    }

    /**
     * Generate ERPC for verification (P99交易驗證資料壓碼)
     * Formula: ERPC DATA = CID + COID + RRN + CUID(3) + AMOUNT(14) + RCODE
     *
     * @param {Object} params - Response parameters from P99
     * @returns {string} ERPC verification code
     */
    calculateERPC(params) {
        const { cid, coid, rrn, cuid, amount, rcode } = params;
        const formattedAmount = this.formatAmount(amount);

        // Build ERPC data string (note: different from PHP - no paid/userAcctId in basic formula)
        let erpcData = cid + coid + rrn + cuid + formattedAmount + rcode;

        // Encrypt with 3DES
        const encryptedData = this.encryptTripleDES(erpcData);

        // SHA1 hash and BASE64 encode
        const sha1Hash = crypto.createHash('sha1').update(encryptedData).digest();
        const erpc = sha1Hash.toString('base64');

        return erpc;
    }

    /**
     * Verify ERPC from P99 response
     * @param {Object} responseData - Decoded response from P99
     * @returns {boolean} Whether ERPC is valid
     */
    verifyERPC(responseData) {
        if (!responseData.ERPC) return false;

        const calculatedERPC = this.calculateERPC({
            cid: responseData.CID,
            coid: responseData.COID,
            rrn: responseData.RRN || '',
            cuid: responseData.CUID,
            amount: responseData.AMOUNT,
            rcode: responseData.RCODE
        });

        return calculatedERPC === responseData.ERPC;
    }

    /**
     * Build order request data
     * @param {Object} params - Order parameters
     * @returns {Object} { jsonData, base64Data }
     */
    buildOrderRequest(params) {
        const {
            coid,
            amount,
            paid,
            userAcctId,
            productName,
            productId,
            memo,
            returnUrl
        } = params;

        const cuid = 'USD'; // P99 uses USD as base currency

        // Truncate userAcctId to 20 chars max (P99 might have length limit)
        const safeUserAcctId = userAcctId ? userAcctId.substring(0, 20) : '';

        const orderData = {
            MSG_TYPE: '0100',           // 交易授權 Request
            PCODE: '300000',            // 一般交易
            CID: this.config.cid,
            COID: coid,
            CUID: cuid,
            PAID: paid || '',           // Empty = show payment selection
            AMOUNT: String(amount),
            ERQC: this.getERQC({ coid, cuid, amount, paid, userAcctId: safeUserAcctId }),
            RETURN_URL: returnUrl || this.config.returnUrl,
            ORDER_TYPE: paid ? 'M' : 'E', // M=指定PA, E=不指定
            // Note: MID is NOT included in order requests per PHP sample (only used in settle)
            PRODUCT_NAME: productName || '',
            PRODUCT_ID: productId || '',
            USER_ACCTID: safeUserAcctId,
            MEMO: memo || ''
        };

        const jsonString = JSON.stringify(orderData);
        const base64Data = Buffer.from(jsonString).toString('base64');

        console.log('[P99Pay Order Debug] JSON:', jsonString);
        console.log('[P99Pay Order Debug] Base64:', base64Data);

        return {
            jsonData: orderData,
            base64Data: base64Data
        };
    }

    /**
     * Build check order (query) request data
     * @param {Object} params - Query parameters
     * @returns {Object} { jsonData, base64Data }
     */
    buildCheckOrderRequest(params) {
        const { coid, amount, cuid = 'USD' } = params;

        const queryData = {
            MSG_TYPE: '0100',           // 查詢 Request
            PCODE: '200000',            // 查詢訂單
            CID: this.config.cid,
            COID: coid,
            CUID: cuid,
            AMOUNT: String(amount),
            ERQC: this.getERQC({ coid, cuid, amount })
        };

        const jsonString = JSON.stringify(queryData);
        const base64Data = Buffer.from(jsonString).toString('base64');

        return {
            jsonData: queryData,
            base64Data: base64Data
        };
    }

    /**
     * Build settle (請款) request data
     * @param {Object} params - Settle parameters
     * @returns {Object} { jsonData, base64Data }
     */
    buildSettleRequest(params) {
        const { coid, amount, paid, cuid = 'USD' } = params;

        const settleData = {
            MSG_TYPE: '0500',           // 請款 Request
            PCODE: '300000',            // 一般交易
            CID: this.config.cid,
            COID: coid,
            CUID: cuid,
            PAID: paid,
            AMOUNT: String(amount),
            ERQC: this.getERQC({ coid, cuid, amount }),
            MID: this.config.mid
        };

        const jsonString = JSON.stringify(settleData);
        const base64Data = Buffer.from(jsonString).toString('base64');

        return {
            jsonData: settleData,
            base64Data: base64Data
        };
    }

    /**
     * Parse BASE64 response from P99
     * @param {string} base64Data - BASE64 encoded response
     * @returns {Object} Parsed JSON data
     */
    parseResponse(base64Data) {
        try {
            // Handle URL encoded data
            let decoded = base64Data;
            if (decoded.includes('%')) {
                decoded = decodeURIComponent(decoded);
            }

            const jsonString = Buffer.from(decoded, 'base64').toString('utf8');
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('[P99Pay] Failed to parse response:', error.message);
            return null;
        }
    }

    /**
     * Make API request to P99
     * @param {string} base64Data - BASE64 encoded request data
     * @returns {Promise<Object>} Parsed response
     */
    async makeRequest(base64Data) {
        const response = await fetch(this.config.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `data=${encodeURIComponent(base64Data)}`
        });

        const responseText = await response.text();

        // Extract data parameter from response
        let data = responseText;
        if (responseText.toLowerCase().startsWith('data=')) {
            data = responseText.substring(5);
        }

        return this.parseResponse(data);
    }

    /**
     * Check order status
     * @param {string} coid - Order ID
     * @param {number} amount - Transaction amount
     * @returns {Promise<Object>} Order status response
     */
    async checkOrder(coid, amount) {
        const request = this.buildCheckOrderRequest({ coid, amount });
        const response = await this.makeRequest(request.base64Data);

        if (response) {
            response.erpcValid = this.verifyERPC(response);
        }

        return response;
    }

    /**
     * Settle (請款) an order
     * @param {string} coid - Order ID
     * @param {number} amount - Transaction amount
     * @param {string} paid - Payment agent ID
     * @returns {Promise<Object>} Settle response
     */
    async settleOrder(coid, amount, paid) {
        const request = this.buildSettleRequest({ coid, amount, paid });
        const response = await this.makeRequest(request.base64Data);

        if (response) {
            response.erpcValid = this.verifyERPC(response);
        }

        return response;
    }
}

/**
 * Generate unique order ID
 * Format: GZ + timestamp + random
 * @returns {string} Unique order ID (max 25 chars)
 */
export function generateOrderId() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `GZ${timestamp}${random}`;
}

/**
 * Payment status codes
 */
export const PAY_STATUS = {
    S: 'success',   // 交易成功
    W: 'waiting',   // PA 交易待確認
    F: 'failed'     // PA 交易失敗
};

/**
 * Response codes that require retry
 */
export const RETRY_RCODES = ['9004', '9997', '9998', '9999'];

/**
 * Payment Agent IDs
 */
export const PAID_TYPES = {
    KIWI_PIN: 'COPKWP01',     // KIWI 點數卡
    KIWI_WALLET: 'COPKWP09'   // KIWI 錢包
};

// Export default instance for convenience
export default new P99PayClient();
