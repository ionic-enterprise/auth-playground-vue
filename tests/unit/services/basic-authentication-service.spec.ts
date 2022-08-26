import { User } from '@/models';
import useBackendAPI from '@/composables/backend-api';
import { BasicAuthenticationService } from '@/services/basic-authentication-service';
import { TokenStorageProvider } from '@ionic-enterprise/auth';

jest.mock('@/composables/backend-api');

describe('useAuth', () => {
  let tokenStorageProvider: TokenStorageProvider;
  let authService: BasicAuthenticationService;
  beforeEach(() => {
    tokenStorageProvider = {
      clear: jest.fn().mockResolvedValue(undefined),
      setAccessToken: jest.fn().mockResolvedValue(undefined),
      getAccessToken: jest.fn().mockResolvedValue(undefined),
    };
    authService = new BasicAuthenticationService(tokenStorageProvider);
    jest.clearAllMocks();
  });

  describe('login', () => {
    const { client } = useBackendAPI();
    let user: User;
    beforeEach(() => {
      user = {
        id: 314159,
        firstName: 'Testy',
        lastName: 'McTest',
        email: 'test@test.com',
      };
      (client.post as any).mockResolvedValue({
        data: {
          success: true,
          user,
          token: '123456789',
        },
      });
    });

    it('posts to the login endpoint', () => {
      authService.login('test@test.com', 'testpassword');
      expect(client.post).toHaveBeenCalledTimes(1);
      expect(client.post).toHaveBeenCalledWith('/login', {
        username: 'test@test.com',
        password: 'testpassword',
      });
    });

    describe('when the login fails', () => {
      beforeEach(() => {
        (client.post as any).mockResolvedValue({
          data: { success: false },
        });
      });

      it('throws an error without setting a session', async () => {
        expect(() => authService.login('test@test.com', 'password')).rejects.toThrow();
        expect(tokenStorageProvider.setAccessToken).not.toHaveBeenCalled();
      });
    });

    describe('when the login succeeds', () => {
      it('sets the session', async () => {
        await authService.login('test@test.com', 'password');
        expect(tokenStorageProvider.setAccessToken).toHaveBeenCalledTimes(1);
        expect(tokenStorageProvider.setAccessToken).toHaveBeenCalledWith('123456789');
      });
    });
  });

  describe('logout', () => {
    const { client } = useBackendAPI();

    it('posts to the login endpoint', () => {
      authService.logout();
      expect(client.post).toHaveBeenCalledTimes(1);
      expect(client.post).toHaveBeenCalledWith('/logout', {});
    });

    it('clears the session', async () => {
      await authService.logout();
      expect(tokenStorageProvider.clear).toHaveBeenCalledTimes(1);
      expect(tokenStorageProvider.clear).toHaveBeenCalledWith();
    });
  });

  describe('get access token', () => {
    it('resolves the token if it exists', async () => {
      (tokenStorageProvider.getAccessToken as jest.Mock).mockResolvedValue('88fueesli32s');
      expect(await authService.getAccessToken()).toEqual('88fueesli32s');
    });

    it('resolves undefined if the token does not exist', async () => {
      expect(await authService.getAccessToken()).toBeUndefined();
    });
  });

  describe('is authenticated', () => {
    it('resolves true if the token exists', async () => {
      (tokenStorageProvider.getAccessToken as jest.Mock).mockResolvedValue('88fueesli32s');
      expect(await authService.isAuthenticated()).toEqual(true);
    });

    it('resolves false if the token does not exist', async () => {
      expect(await authService.isAuthenticated()).toEqual(false);
    });
  });
});
