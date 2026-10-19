package org.example.ai_media_workbench.vo.auth;

import java.time.Instant;

/**
 * 只返回申请标识和到期时间，绝不返回验证码。
 * record 是 Java 定义数据类的关键字，括号内声明字段；自动生成构造方法、
 * 同名字段读取方法、toString、equals 和 hashCode，字段不能重新赋值，也不生成 setter。
 *
 * @param challengeId 验证码申请记录编号
 * @param expiresAt 验证码过期时间
 */
public record RegistrationEmailVO(String challengeId, Instant expiresAt) {}
