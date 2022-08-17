import { IonicAuth } from '@ionic-enterprise/auth';
import useSessionVault from './session-vault';
import useAuthConfig from './auth-config';

class AuthenticationService extends IonicAuth {
  constructor() {
    const { tokenStorage } = useSessionVault();
    const { config } = useAuthConfig();
    config.tokenStorageProvider = tokenStorage;
    super(config);
  }

  async onLogout(): Promise<void> {
    const { tokenStorage } = useSessionVault();
    await tokenStorage.clear();
  }
}

const authService = new AuthenticationService();

const isAuthenticated = (): Promise<boolean> => {
  return authService.isAuthenticated();
};

export default (): any => {
  return {
    getAccessToken: (): Promise<string | undefined> => authService.getAccessToken(),
    isAuthenticated,
    login: (): Promise<void> => authService.login(),
    logout: (): Promise<void> => authService.logout(),
  };
};
