package com.idealighter.utils.exception;

/**
 * Crypto runtime exception.
 * Replacement for missing com.idealighter:utils-core dependency.
 */
public class CyptoRuntimeException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public CyptoRuntimeException() {
        super();
    }

    public CyptoRuntimeException(String message) {
        super(message);
    }

    public CyptoRuntimeException(String message, Throwable cause) {
        super(message, cause);
    }

    public CyptoRuntimeException(Throwable cause) {
        super(cause);
    }
}
