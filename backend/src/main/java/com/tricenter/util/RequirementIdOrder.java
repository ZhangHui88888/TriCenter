package com.tricenter.util;

/**
 * 标准需求 ID（如 1.1.1、2.3.10）按文档序号排序：逐段数值比较。
 */
public final class RequirementIdOrder {

    private RequirementIdOrder() {
    }

    /**
     * 与 {@link String#compareTo} 兼容的 Comparator 返回值。
     */
    public static int compare(String a, String b) {
        if (a == null && b == null) {
            return 0;
        }
        if (a == null) {
            return -1;
        }
        if (b == null) {
            return 1;
        }
        String[] pa = a.split("\\.");
        String[] pb = b.split("\\.");
        int n = Math.max(pa.length, pb.length);
        for (int i = 0; i < n; i++) {
            boolean ha = i < pa.length;
            boolean hb = i < pb.length;
            if (!ha && !hb) {
                return 0;
            }
            if (!ha) {
                return -1;
            }
            if (!hb) {
                return 1;
            }
            Integer ia = tryParsePositiveInt(pa[i]);
            Integer ib = tryParsePositiveInt(pb[i]);
            if (ia != null && ib != null) {
                int c = ia.compareTo(ib);
                if (c != 0) {
                    return c;
                }
            } else {
                int c = pa[i].compareTo(pb[i]);
                if (c != 0) {
                    return c;
                }
            }
        }
        return 0;
    }

    private static Integer tryParsePositiveInt(String s) {
        if (s == null || s.isEmpty()) {
            return null;
        }
        try {
            return Integer.parseInt(s);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
