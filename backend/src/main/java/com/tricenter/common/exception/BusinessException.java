package com.tricenter.common.exception;

import lombok.Getter;

/**
 * 业务异常
 */
@Getter
public class BusinessException extends RuntimeException {
    
    private final int code;
    private final String errorKey;

    public BusinessException(String message) {
        super(message);
        this.code = 500;
        this.errorKey = null;
    }

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
        this.errorKey = null;
    }

    public BusinessException(int code, String errorKey, String message) {
        super(message);
        this.code = code;
        this.errorKey = errorKey;
    }

    public static BusinessException badRequest(String message) {
        return new BusinessException(400, message);
    }

    public static BusinessException unauthorized(String message) {
        return new BusinessException(401, message);
    }

    public static BusinessException unauthorized(String errorKey, String message) {
        return new BusinessException(401, errorKey, message);
    }

    public static BusinessException forbidden(String message) {
        return new BusinessException(403, message);
    }

    public static BusinessException forbidden(String errorKey, String message) {
        return new BusinessException(403, errorKey, message);
    }

    public static BusinessException notFound(String message) {
        return new BusinessException(404, message);
    }
}
