package com.idealighter.utils.code;

import java.util.Random;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Utility class for random code/number generation.
 * Replacement for missing com.idealighter:utils-core dependency.
 */
public class RandCodeUtil {

    private static final Random RANDOM = new Random();

    /**
     * Generate random int from 0 (inclusive) to max (exclusive)
     */
    public static int random(int max) {
        if (max <= 0) {
            return 0;
        }
        return ThreadLocalRandom.current().nextInt(max);
    }

    /**
     * Generate random long from 0 (inclusive) to max (exclusive)
     */
    public static long random(long max) {
        if (max <= 0) {
            return 0;
        }
        return ThreadLocalRandom.current().nextLong(max);
    }

    /**
     * Generate random int from min (inclusive) to max (inclusive)
     */
    public static int random(int min, int max) {
        if (min >= max) {
            return min;
        }
        return ThreadLocalRandom.current().nextInt(min, max + 1);
    }

    /**
     * Generate random long from min (inclusive) to max (inclusive)
     */
    public static long random(long min, long max) {
        if (min >= max) {
            return min;
        }
        return ThreadLocalRandom.current().nextLong(min, max + 1);
    }

    /**
     * Generate random int from long min/max (inclusive) - casts to int
     * This is to handle cases where long values are passed but int is expected
     */
    public static int randomInt(long min, long max) {
        return (int) random(min, max);
    }

    /**
     * Generate random boolean
     */
    public static boolean randomBoolean() {
        return ThreadLocalRandom.current().nextBoolean();
    }

    /**
     * Generate random alphanumeric string of given length
     * Alias for randomCode
     */
    public static String createString(int length) {
        return randomCode(length);
    }

    /**
     * Generate random alphanumeric string of given length
     */
    public static String randomCode(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random(chars.length())));
        }
        return sb.toString();
    }

    /**
     * Generate random numeric string of given length
     */
    public static String randomNumericCode(int length) {
        String chars = "0123456789";
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random(chars.length())));
        }
        return sb.toString();
    }

    /**
     * Shuffle a list and return the first element
     * This is used to randomly select one element from a list
     */
    public static <T> T randomList(java.util.List<T> list) {
        if (list == null || list.isEmpty()) {
            return null;
        }
        java.util.Collections.shuffle(list, ThreadLocalRandom.current());
        return list.get(0);
    }

    /**
     * Check probability - returns true with probability of numerator/denominator
     * @param numerator probability numerator (e.g., 30 for 30%)
     * @param denominator probability denominator (e.g., 100 for 30%)
     * @return true if random check passes
     */
    public static boolean probable(int numerator, int denominator) {
        if (denominator <= 0) {
            return false;
        }
        if (numerator >= denominator) {
            return true;
        }
        if (numerator <= 0) {
            return false;
        }
        return random(denominator) < numerator;
    }
}
