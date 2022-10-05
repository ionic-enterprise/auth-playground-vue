import { AuthProvider } from '@/models';
import { IonicAuth, IonicAuthOptions, TokenStorageProvider } from '@ionic-enterprise/auth';
import { isPlatform } from '@ionic/vue';
import { Authenticator } from './authenticator';

const baseAuth0Config: IonicAuthOptions = {
  // audience value is required for auth0's config. If it doesn't exist, the jwt payload will be empty
  audience: 'https://io.ionic.demo.ac',
  authConfig: 'auth0' as const,
  clientID: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
  discoveryUrl: 'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
  logoutUrl: '',
  scope: 'openid email picture profile',
  logLevel: 'DEBUG',
};

const mobileAuth0Config: IonicAuthOptions = {
  ...baseAuth0Config,
  redirectUri: 'msauth://login',
  logoutUrl: 'msauth://login',
  platform: 'capacitor',
  iosWebView: 'private',
};

const webAuth0Config: IonicAuthOptions = {
  ...baseAuth0Config,
  redirectUri: 'http://localhost:8100/login',
  logoutUrl: 'http://localhost:8100/login',
  platform: 'web',
};

const baseAWSConfig = {
  authConfig: 'cognito' as const,
  clientID: '64p9c53l5thd5dikra675suvq9',
  discoveryUrl: 'https://cognito-idp.us-east-2.amazonaws.com/us-east-2_YU8VQe29z/.well-known/openid-configuration',
  scope: 'openid email profile',
  audience: '',
};

const mobileAWSConfig: IonicAuthOptions = {
  ...baseAWSConfig,
  redirectUri: 'msauth://login',
  logoutUrl: 'msauth://login',
  platform: 'capacitor',
  iosWebView: 'private',
};

const webAWSConfig: IonicAuthOptions = {
  ...baseAWSConfig,
  redirectUri: 'http://localhost:8100/login',
  logoutUrl: 'http://localhost:8100/login',
  platform: 'web',
};

const baseAzureConfig = {
  authConfig: 'azure' as const,
  clientID: 'b69e2ee7-b67a-4e26-8a38-f7ca30d2e4d4',
  scope: 'openid offline_access email profile https://vikingsquad.onmicrosoft.com/api/Hello.Read',
  discoveryUrl:
    'https://vikingsquad.b2clogin.com/vikingsquad.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=B2C_1_Signup_Signin',
  audience: 'https://api.myapp.com',
};

const mobileAzureConfig: IonicAuthOptions = {
  ...baseAzureConfig,
  redirectUri: 'myapp://callback',
  logoutUrl: 'myapp://callback?logout=true',
  platform: 'capacitor',
  iosWebView: 'private',
};

const webAzureConfig: IonicAuthOptions = {
  ...baseAzureConfig,
  redirectUri: 'http://localhost:8100/login',
  logoutUrl: 'http://localhost:8100/login',
  platform: 'web',
};

const auth0Config = isPlatform('hybrid') ? mobileAuth0Config : webAuth0Config;
const awsConfig = isPlatform('hybrid') ? mobileAWSConfig : webAWSConfig;
const azureConfig = isPlatform('hybrid') ? mobileAzureConfig : webAzureConfig;

export class OIDCAuthenticationService extends IonicAuth implements Authenticator {
  constructor(private provider: AuthProvider, private tokenStorageProvider: TokenStorageProvider) {
    const config = provider === 'AWS' ? awsConfig : provider === 'Auth0' ? auth0Config : azureConfig;
    super({ ...config, tokenStorageProvider });
  }

  async login(): Promise<void> {
    try {
      await super.login();
    } catch (err: any) {
      console.log('login error:', +err);
      const message: string = err.message;
      if (this.provider === 'Azure' && message !== undefined && message.startsWith('AADB2C90118')) {
        // This is to handle the password reset case for Azure AD and is only applicable to Azure  AD
        // The address you pass back is the custom user flow (policy) endpoint
        await super.login(
          'https://vikingsquad.b2clogin.com/vikingsquad.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=B2C_1_password_reset'
        );
      } else {
        throw new Error(err.error);
      }
    }
  }
}
