package com.idealighter.utils.sms.alidayu;

import com.idealighter.utils.sms.alidayu.bo.SmsSendResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Stub implementation for Alidayu SMS utility.
 * Replacement for missing com.idealighter:utils-sms dependency.
 *
 * In production, this should be replaced with actual Alibaba Cloud SMS SDK.
 */
public class SmsAlidayuUtil {

    private static final Logger log = LoggerFactory.getLogger(SmsAlidayuUtil.class);

    /**
     * Send SMS verification code.
     * This is a stub implementation that logs the SMS instead of actually sending it.
     *
     * @param phone Phone number
     * @param smsCode SMS verification code
     * @param signName SMS signature
     * @param templateCode SMS template code
     * @param accessKeyId Aliyun access key ID
     * @param accessKeySecret Aliyun access key secret
     * @return SmsSendResult
     */
    public static SmsSendResult sendSmsCode(String phone, String smsCode,
            String signName, String templateCode,
            String accessKeyId, String accessKeySecret) {

        // Stub implementation - just log the SMS
        log.info("[SMS STUB] Sending SMS to {} with code: {} (signName={}, template={})",
                phone, smsCode, signName, templateCode);

        // Always return OK for local testing
        return SmsSendResult.OK;
    }
}
