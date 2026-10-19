package org.example.ai_media_workbench.service.impl;

import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import java.util.Locale;
import java.util.Set;

/** 注册和改密共用的新密码策略；登录只验证原密码，不重新施加新密码规则。 */
final class PasswordPolicy {
    private static final Set<String> WEAK = Set.of(
            "passwordpassword", "password123456789", "123456789012345", "qwertyuiopasdfgh");

    private PasswordPolicy() {}

    /** 检查新密码的长度和弱密码规则，不符合时抛出异常。 */
    static void check(String password) {
        // 第一步：按 Unicode 码点统计密码字符数。
        int count = password.codePointCount(0, password.length());
        // 第二步：检查长度是否在 6～16 个字符之间，不符合就抛出参数错误。
        if (count < 6 || count > 16) {
            throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
        }
        // 第三步：检查是否全为空白、不同字符不足三种或命中弱密码列表，任意一项成立就拒绝。
        if (password.isBlank() || password.codePoints().distinct().count() < 3
                || WEAK.contains(password.toLowerCase(Locale.ROOT))) {
            throw new BusinessException(ErrorCode.WEAK_PASSWORD);
        }
        // 所有检查通过后正常结束，调用方继续执行注册或改密流程。
    }
}
