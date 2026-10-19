package org.example.ai_media_workbench.common.exception;

/** Range errors need both the unified Result and the actual resource length header. */
public class RangeNotSatisfiableException extends BusinessException {
    private final long size;
    public RangeNotSatisfiableException(long size) { super(ErrorCode.RANGE_NOT_SATISFIABLE); this.size = size; }
    public long size() { return size; }
}
