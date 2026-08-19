package com.tricenter.common.result;

/**
 * Stable machine-readable error identifiers shared with API clients.
 */
public final class ErrorKeys {

    public static final String CITY_SELECTION_REQUIRED = "CITY_SELECTION_REQUIRED";
    public static final String CITY_ACCESS_REVOKED = "CITY_ACCESS_REVOKED";
    public static final String TOKEN_EXPIRED = "TOKEN_EXPIRED";
    public static final String ACCOUNT_DISABLED = "ACCOUNT_DISABLED";

    private ErrorKeys() {
    }
}
