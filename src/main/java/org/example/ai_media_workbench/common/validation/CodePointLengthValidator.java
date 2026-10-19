package org.example.ai_media_workbench.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class CodePointLengthValidator implements ConstraintValidator<CodePointLength, String> {
    private int min;
    private int max;

    /** 读取注解中配置的最小和最大字符数。 */
    @Override
    public void initialize(CodePointLength annotation) {
        min = annotation.min();
        max = annotation.max();
    }

    /** 按 Unicode 码点检查字符串长度是否符合范围。 */
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            // 长度约束只负责长度；必填要求另用 @NotNull，便于允许可选字段。
            return true;
        }
        int length = value.codePointCount(0, value.length());
        return length >= min && length <= max;
    }
}
