import useSessionVault from './session-vault';
import { Authenticator, BasicAuthenticationService, OIDCAuthenticationService } from '@/services';
import { AuthProvider } from '@/models';
import { Preferences } from '@capacitor/preferences';

let authService: Authenticator | undefined;
const key = 'AuthProvider';

const constructAuthService = (provider: AuthProvider): void => {
  const { tokenStorage } = useSessionVault();
  if (provider === 'Basic') {
    authService = new BasicAuthenticationService(tokenStorage);
  } else {
    authService = new OIDCAuthenticationService(provider, tokenStorage);
  }
};

const initializeAuthService = async (): Promise<void> => {
  if (!authService) {
    const { value } = await Preferences.get({ key });
    if (value) {
      constructAuthService(value as AuthProvider);
    }
  }
};

const login = async (provider: AuthProvider, username?: string, password?: string): Promise<void> => {
  constructAuthService(provider);
  await Preferences.set({ key, value: provider });
  await (provider === 'Basic' ? authService?.login(username, password) : authService?.login());
};

const logout = async (): Promise<void> => {
  await initializeAuthService();
  await authService?.logout();
  authService = undefined;
};

const getAccessToken = async (): Promise<string | undefined> => {
  await initializeAuthService();
  return await authService?.getAccessToken();
};

const isAuthenticated = async (): Promise<boolean> => {
  await initializeAuthService();
  return authService ? await authService.isAuthenticated() : false;
};

export default (): any => {
  return {
    getAccessToken,
    isAuthenticated,
    login,
    logout,
  };
};
