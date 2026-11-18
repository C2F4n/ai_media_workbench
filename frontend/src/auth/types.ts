import type { LoginRequest, RegisterRequest, RegistrationEmailChallenge, User } from '../api/contracts';

export type AuthPanel = 'home' | 'login' | 'register';

export interface AuthEntryServices {
  visible: boolean;
  registrationAllowed: boolean;
  login(body: LoginRequest): Promise<void>;
  sendCode(email: string): Promise<RegistrationEmailChallenge>;
  register(body: RegisterRequest): Promise<User>;
}
