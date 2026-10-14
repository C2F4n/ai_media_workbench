package org.example.ai_media_workbench.dto.common;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PageQuery {
    @Min(1)
    private int page = 1;
    @Min(1)
    @Max(100)
    private int pageSize = 20;

    public long offset() { return (long) (page - 1) * pageSize; }
}
