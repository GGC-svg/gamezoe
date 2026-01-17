package com.idealighter.utils.time;

import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Time utility class.
 * Replacement for missing com.idealighter:utils-core dependency.
 */
public class TimeUtil {

    /**
     * Get current timestamp in milliseconds
     */
    public static long getTimeMillis() {
        return System.currentTimeMillis();
    }

    /**
     * Get current Date
     */
    public static Date now() {
        return new Date();
    }

    /**
     * Format date with pattern
     */
    public static String format(String pattern, Date date) {
        if (date == null) {
            return null;
        }
        SimpleDateFormat sdf = new SimpleDateFormat(pattern);
        return sdf.format(date);
    }

    /**
     * Format current time with pattern
     */
    public static String format(String pattern) {
        return format(pattern, now());
    }

    /**
     * Parse date string with pattern
     */
    public static Date parse(String pattern, String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) {
            return null;
        }
        try {
            SimpleDateFormat sdf = new SimpleDateFormat(pattern);
            return sdf.parse(dateStr);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Get start of day for given date
     */
    public static Date getStartOfDay(Date date) {
        if (date == null) {
            return null;
        }
        java.util.Calendar cal = java.util.Calendar.getInstance();
        cal.setTime(date);
        cal.set(java.util.Calendar.HOUR_OF_DAY, 0);
        cal.set(java.util.Calendar.MINUTE, 0);
        cal.set(java.util.Calendar.SECOND, 0);
        cal.set(java.util.Calendar.MILLISECOND, 0);
        return cal.getTime();
    }

    /**
     * Get end of day for given date
     */
    public static Date getEndOfDay(Date date) {
        if (date == null) {
            return null;
        }
        java.util.Calendar cal = java.util.Calendar.getInstance();
        cal.setTime(date);
        cal.set(java.util.Calendar.HOUR_OF_DAY, 23);
        cal.set(java.util.Calendar.MINUTE, 59);
        cal.set(java.util.Calendar.SECOND, 59);
        cal.set(java.util.Calendar.MILLISECOND, 999);
        return cal.getTime();
    }
}
