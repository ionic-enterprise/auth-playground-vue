import { AuthProvider } from '@/models';
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  AzureProvider,
  CognitoProvider,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { isPlatform } from '@ionic/vue';
import { Authenticator } from './authenticator';
import { useSessionVault } from '@/composables/session-vault';

const isMobile = isPlatform('hybrid');

const auth0Options: ProviderOptions = {
  // audience value is required for auth0's config. If it doesn't exist, the jwt payload will be empty
  audience: 'https://io.ionic.demo.ac',
  clientId: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
  discoveryUrl: 'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
  logoutUrl: isMobile ? 'msauth://login' : 'http://localhost:8100/login',
  redirectUri: isMobile ? 'msauth://login' : 'http://localhost:8100/login',
  scope: 'openid email picture profile offline_access',
};

const cognitoOptions: ProviderOptions = {
  clientId: '64p9c53l5thd5dikra675suvq9',
  discoveryUrl: 'https://cognito-idp.us-east-2.amazonaws.com/us-east-2_YU8VQe29z/.well-known/openid-configuration',
  logoutUrl: isMobile ? 'msauth://login' : 'http://localhost:8100/login',
  redirectUri: isMobile ? 'msauth://login' : 'http://localhost:8100/login',
  scope: 'openid email profile',
  audience: '',
};

const azureOptions: ProviderOptions = {
  clientId: 'b69e2ee7-b67a-4e26-8a38-f7ca30d2e4d4',
  scope: 'openid offline_access email profile https://vikingsquad.onmicrosoft.com/api/Hello.Read',
  discoveryUrl:
    'https://vikingsquad.b2clogin.com/vikingsquad.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=B2C_1_Signup_Signin',
  redirectUri: isMobile ? 'myapp://callback' : 'http://localhost:8100/login',
  logoutUrl: isMobile ? 'myapp://callback?logout=true' : 'http://localhost:8100/login',
  audience: 'https://api.myapp.com',
};

export class OIDCAuthenticationService implements Authenticator {
  private authResultKey = 'auth-result';
  private provider: Auth0Provider | AzureProvider | CognitoProvider | null = null;
  private options: ProviderOptions | null = null;
  private initializing: Promise<void> | undefined;

  constructor() {
    this.initialize();
  }

  setAuthProvider(authProvider: AuthProvider): void {
    switch (authProvider) {
      case 'Auth0':
        this.provider = new Auth0Provider();
        this.options = auth0Options;
        break;

      case 'AWS':
        this.provider = new CognitoProvider();
        this.options = cognitoOptions;
        break;

      case 'Azure':
        this.provider = new AzureProvider();
        this.options = azureOptions;
        break;

      default:
        console.error('Invalid auth provider: ' + authProvider);
        break;
    }
  }

  async login(): Promise<void> {
    if (!this.provider || !this.options) {
      console.log('be sure to run setAuthProvider before calling login');
      return;
    }
    const { setValue } = useSessionVault();
    await this.initialize();
    try {
      const res = await AuthConnect.login(this.provider, this.options);
      setValue(this.authResultKey, res);
    } catch (err: any) {
      // eslint-disable-next-line
      console.log('login error:', err);
      const message: string = err.errorMessage;
      if (this.options === azureOptions && message !== undefined && message.includes('AADB2C90118')) {
        // This is to handle the password reset case for Azure AD and is only applicable to Azure  AD
        // The address you pass back is the custom user flow (policy) endpoint
        const res = await AuthConnect.login(this.provider, {
          ...this.options,
          discoveryUrl:
            'https://vikingsquad.b2clogin.com/vikingsquad.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=B2C_1_password_reset',
        });
        setValue(this.authResultKey, res);
      } else {
        throw new Error(err.error);
      }
    }
  }

  async logout(): Promise<void> {
    if (!this.provider) {
      console.log('be sure to run setAuthProvider before calling logout');
      return;
    }
    await this.initialize();
    const authResult = await this.getAuthResult();
    if (authResult) {
      const { clear } = useSessionVault();
      await AuthConnect.logout(this.provider, authResult);
      await clear();
    }
  }

  async getAccessToken(): Promise<string | undefined> {
    await this.initialize();
    const authResult = await this.getAuthResult();
    return authResult?.accessToken;
  }

  async isAuthenticated(): Promise<boolean> {
    await this.initialize();
    return !!(await this.getAuthResult());
  }

  private initialize(): Promise<void> {
    if (!this.initializing) {
      this.initializing = new Promise((resolve) => {
        this.performInit().then(() => resolve());
      });
    }
    return this.initializing;
  }

  private async performInit(): Promise<void> {
    await AuthConnect.setup({
      platform: isMobile ? 'capacitor' : 'web',
      logLevel: 'DEBUG',
      ios: {
        webView: 'private',
      },
      web: {
        uiMode: 'popup',
        authFlow: 'implicit',
      },
    });
  }

  private async getAuthResult(): Promise<AuthResult | undefined> {
    const { getValue } = useSessionVault();
    let authResult = (await getValue(this.authResultKey)) as AuthResult | undefined;
    if (authResult && (await AuthConnect.isAccessTokenExpired(authResult))) {
      authResult = await this.performRefresh(authResult);
    }
    return authResult;
  }

  private async performRefresh(authResult: AuthResult): Promise<AuthResult | undefined> {
    const { clear, setValue } = useSessionVault();
    let newAuthResult: AuthResult | undefined;

    if (!this.provider) {
      console.log('be sure to run setAuthProvider');
      return;
    }

    if (await AuthConnect.isRefreshTokenAvailable(authResult)) {
      try {
        newAuthResult = await AuthConnect.refreshSession(this.provider, authResult);
        setValue(this.authResultKey, newAuthResult);
      } catch (err) {
        await clear();
      }
    } else {
      await clear();
    }

    return newAuthResult;
  }
}
