package de.ovgu.spldev.varied;

import java.util.Arrays;

public class StringUtils {
    public static boolean isPresent(String s) {
        return s != null && !s.trim().isEmpty();
    }

    public static String toClassName(String prefix, String s) {
        s = s.toLowerCase();
        String[] parts = s.split("_");
        StringBuilder className = new StringBuilder(prefix);
        for (String part : parts)
            className.append(part.substring(0, 1).toUpperCase()).append(part.substring(1));
        return className.toString();
    }

    public static boolean isOneOf(String s, String[] strings) {
        return Arrays.asList(strings).contains(s);
    }
}
