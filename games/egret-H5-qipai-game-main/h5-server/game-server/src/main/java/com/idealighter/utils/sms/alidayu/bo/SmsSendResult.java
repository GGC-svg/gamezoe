package com.idealighter.utils.sms.alidayu.bo;

/**
 * SMS send result enum.
 * Replacement for missing com.idealighter:utils-sms dependency.
 */
public enum SmsSendResult {
    OK,      // 发送成功
    LIMIT,   // 发送频率限制
    FAIL     // 发送失败
}
