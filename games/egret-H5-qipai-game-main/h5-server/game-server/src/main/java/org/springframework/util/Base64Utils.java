package org.springframework.util;

import java.util.Base64;
import java.nio.charset.StandardCharsets;

/**
 * Base64 utility class.
 * Replacement for Spring's Base64Utils to avoid adding Spring dependency.
 */
public class Base64Utils {

    /**
     * Encode byte array to Base64 string
     */
    public static String encodeToString(byte[] src) {
        if (src == null || src.length == 0) {
            return "";
        }
        return Base64.getEncoder().encodeToString(src);
    }

    /**
     * Decode Base64 string to byte array
     */
    public static byte[] decodeFromString(String src) {
        if (src == null || src.isEmpty()) {
            return new byte[0];
        }
        return Base64.getDecoder().decode(src);
    }

    /**
     * Encode byte array to Base64 byte array
     */
    public static byte[] encode(byte[] src) {
        if (src == null || src.length == 0) {
            return new byte[0];
        }
        return Base64.getEncoder().encode(src);
    }

    /**
     * Decode Base64 byte array to byte array
     */
    public static byte[] decode(byte[] src) {
        if (src == null || src.length == 0) {
            return new byte[0];
        }
        return Base64.getDecoder().decode(src);
    }

    /**
     * URL-safe Base64 encode
     */
    public static String encodeToUrlSafeString(byte[] src) {
        if (src == null || src.length == 0) {
            return "";
        }
        return Base64.getUrlEncoder().withoutPadding().encodeToString(src);
    }

    /**
     * URL-safe Base64 decode
     */
    public static byte[] decodeFromUrlSafeString(String src) {
        if (src == null || src.isEmpty()) {
            return new byte[0];
        }
        return Base64.getUrlDecoder().decode(src);
    }
}
