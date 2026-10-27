const weakPasswords = new Set(['passwordpassword', 'password123456789', '123456789012345', 'qwertyuiopasdfgh']);

// Match the server's Unicode code-point count, including older passwords at login.
export function newPasswordIssue(password: string): string {
  if (!password) return '请输入密码。';
  const characters = Array.from(password);
  if (characters.length < 6 || characters.length > 16) return '密码需要6–16个字符。';
  if (!password.trim() || new Set(characters).size < 3 || weakPasswords.has(password.toLowerCase())) return '密码过于简单：至少使用3个不同字符，且不要使用常见弱密码。';
  return '';
}
export function usernameIssue(value: string): string {
  return !value ? '请输入用户名。' : /^[a-zA-Z0-9_]{4,32}$/.test(value) ? '' : '用户名需要4–32位英文字母、数字或下划线，不能包含空格或中文。';
}
export function existingPasswordIssue(value: string, label: string): string {
  return !value ? `请输入${label}。` : Array.from(value).length > 128 ? `${label}最多128个字符。` : '';
}
