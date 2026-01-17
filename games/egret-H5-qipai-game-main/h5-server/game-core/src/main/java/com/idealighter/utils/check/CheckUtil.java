package com.idealighter.utils.check;

import java.util.regex.Pattern;

/**
 * Validation utility class.
 * Replacement for missing com.idealighter:utils-core dependency.
 */
public class CheckUtil {

    // Chinese phone number pattern
    private static final Pattern PHONE_PATTERN = Pattern.compile("^1[3-9]\\d{9}$");

    /**
     * Check if value is greater than or equal to min
     */
    public static boolean checkMinValue(Number value, Number min) {
        if (value == null || min == null) {
            return false;
        }
        return value.doubleValue() >= min.doubleValue();
    }

    /**
     * Check if value is between min and max (inclusive)
     */
    public static boolean checkRange(Number value, Number min, Number max) {
        if (value == null || min == null || max == null) {
            return false;
        }
        double v = value.doubleValue();
        return v >= min.doubleValue() && v <= max.doubleValue();
    }

    /**
     * Check if string is a valid Chinese phone number
     */
    public static boolean checkTelephone(String phone) {
        if (phone == null || phone.isEmpty()) {
            return false;
        }
        return PHONE_PATTERN.matcher(phone).matches();
    }

    /**
     * Check if string length equals expected length
     */
    public static boolean checkLength(String str, int expectedLength) {
        if (str == null) {
            return false;
        }
        return str.length() == expectedLength;
    }

    /**
     * Check if string length is within range
     */
    public static boolean checkLength(String str, int minLength, int maxLength) {
        if (str == null) {
            return minLength <= 0;
        }
        int len = str.length();
        return len >= minLength && len <= maxLength;
    }

    /**
     * Check if string is not null and not empty
     */
    public static boolean checkNotEmpty(String str) {
        return str != null && !str.isEmpty();
    }
}
