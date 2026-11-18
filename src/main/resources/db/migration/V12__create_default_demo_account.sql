-- 首次部署提供可直接登录的演示账号；密码使用与应用一致的 Argon2id 哈希。
-- 只在 admin 不存在时创建，升级不会覆盖已有账号的密码、资料或注销状态。
-- 占位邮箱不标记为已验证，不依赖 SMTP；普通账号注册仍要求邮箱验证码。
INSERT INTO app_user
    (id, username, email, display_name, password_hash, email_verified, status, created_at, updated_at)
SELECT UUID(), 'admin', 'admin@frameflow.invalid', 'admin',
       '$argon2id$v=19$m=19456,t=2,p=1$vEioG2R6Q16RAEGrnxe1fQ$Tmk38T8EHtbBlJmHN4oCHi5QbaAnjoiV9h1iu883rC8',
       FALSE, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM app_user WHERE username = 'admin');
