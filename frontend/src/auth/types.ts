export type AuthMode = 'login' | 'register';
export type AuthFieldId = 'login-username' | 'login-password' | 'register-username' | 'register-email' | 'register-email-code' | 'register-name' | 'register-password' | 'register-confirm-password';
export interface RegistrationChallenge { challengeId: string; expiresAt: string }
export interface LoginBody { username: string; password: string; rememberMe: boolean }
export interface RegisterBody { username: string; email: string; emailCode: string; emailChallengeId: string; password: string; displayName?: string }
export interface AuthServices {
  login(body: LoginBody): Promise<void>;
  register(body: RegisterBody): Promise<{ username: string }>;
  sendCode(email: string): Promise<RegistrationChallenge>;
  registered(): void;
  setBusy(value: boolean): void;
  expired(message: string): Promise<void>;
}
export interface AuthStatus { busy: boolean; registration: boolean | null }
export interface AuthView {
  update(status: AuthStatus): void;
  notice(message: string, error?: boolean): void;
  clearPasswords(): void;
  switchMode(mode: AuthMode, animate?: boolean): void;
  stopAnimation(): void;
}
