import { IonicAuth } from '@ionic-enterprise/auth';
import useSessionVault from './session-vault';
import useAuthConfig from './auth-config';
import { User } from '@/models';

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

const getUserInfo = async (): Promise<User | undefined> => {
  const idToken = await authService.getIdToken();
  if (!idToken) {
    return;
  }

  let email = idToken.email;
  if (idToken.emails instanceof Array) {
    email = idToken.emails[0];
  }

  return {
    id: idToken.sub,
    email: email,
    firstName: idToken.firstName,
    lastName: idToken.lastName,
  };
};

export default (): any => {
  return {
    getAccessToken: (): Promise<string | undefined> => authService.getAccessToken(),
    getUserInfo,
    isAuthenticated,
    login: (): Promise<void> => authService.login(),
    logout: (): Promise<void> => authService.logout(),
  };
};
