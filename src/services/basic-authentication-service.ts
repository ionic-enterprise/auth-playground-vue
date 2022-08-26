import { TokenStorageProvider } from '@ionic-enterprise/auth';
import { Authenticator } from './authenticator';
import useBackendAPI from '@/composables/backend-api';

export class BasicAuthenticationService implements Authenticator {
  constructor(private vault: TokenStorageProvider) {}

  async login(email: string, password: string): Promise<void> {
    const { client } = useBackendAPI();
    const response = await client.post('/login', { username: email, password });
    const { success, ...session } = response.data;

    if (success) {
      return this.vault.setAccessToken?.(session.token);
    } else {
      return Promise.reject(new Error('Login Failed'));
    }
  }

  async logout(): Promise<void> {
    const { client } = useBackendAPI();
    await client.post('/logout', {});
    return this.vault.clear?.();
  }

  async getAccessToken(): Promise<string | undefined> {
    return await this.vault.getAccessToken?.();
  }

  async isAuthenticated(): Promise<boolean> {
    return !!(await this.getAccessToken());
  }
}
