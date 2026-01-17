package com.idealighter.utils.check;

import java.util.Collection;
import java.util.List;
import java.util.Map;

/**
 * Utility class for checking empty/null values.
 * Replacement for missing com.idealighter:utils-core dependency.
 */
public class EmptyUtil {

    public static boolean stringIsEmpty(String str) {
        return str == null || str.isEmpty();
    }

    public static boolean stringIsNotEmpty(String str) {
        return !stringIsEmpty(str);
    }

    public static boolean listIsEmpty(List<?> list) {
        return list == null || list.isEmpty();
    }

    public static boolean listIsNotEmpty(List<?> list) {
        return !listIsEmpty(list);
    }

    public static boolean arrayIsEmpty(Object[] array) {
        return array == null || array.length == 0;
    }

    public static boolean arrayIsNotEmpty(Object[] array) {
        return !arrayIsEmpty(array);
    }

    public static boolean isEmpty(Collection<?> collection) {
        return collection == null || collection.isEmpty();
    }

    public static boolean isNotEmpty(Collection<?> collection) {
        return !isEmpty(collection);
    }

    public static boolean mapIsEmpty(Map<?, ?> map) {
        return map == null || map.isEmpty();
    }

    public static boolean mapIsNotEmpty(Map<?, ?> map) {
        return !mapIsEmpty(map);
    }
}
