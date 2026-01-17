package com.idealighter.utils.crypto;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Utility class for MD5 hashing.
 * Replacement for missing com.idealighter:utils-core dependency.
 */
public class MD5Utils {

    private static final char[] HEX_CHARS = "0123456789abcdef".toCharArray();

    /**
     * Encode string to MD5 hash (lowercase hex)
     */
    public static String encode(String input) {
        if (input == null) {
            return null;
        }
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(input.getBytes());
            return bytesToHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("MD5 algorithm not found", e);
        }
    }

    /**
     * Encode string to MD5 hash with specified charset
     */
    public static String encode(String input, String charset) {
        if (input == null) {
            return null;
        }
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(input.getBytes(charset));
            return bytesToHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("MD5 algorithm not found", e);
        } catch (Exception e) {
            throw new RuntimeException("Encoding error", e);
        }
    }

    /**
     * Encode bytes to MD5 hash
     */
    public static String encode(byte[] input) {
        if (input == null) {
            return null;
        }
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(input);
            return bytesToHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("MD5 algorithm not found", e);
        }
    }

    /**
     * Convert byte array to hex string (lowercase)
     */
    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(HEX_CHARS[(b >> 4) & 0x0F]);
            sb.append(HEX_CHARS[b & 0x0F]);
        }
        return sb.toString();
    }
}
