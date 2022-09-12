import LoginPage from '@/views/LoginPage.vue';
import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { Router, createRouter, createWebHistory } from 'vue-router';
import waitForExpect from 'wait-for-expect';
import useAuth from '@/composables/auth';
import useSessionVault from '@/composables/session-vault';
import { AuthProvider } from '@/models/AuthProvider';

jest.mock('@/composables/auth');
jest.mock('@/composables/session-vault');

describe('LoginPage.vue', () => {
  let router: Router;

  const mountView = async (): Promise<VueWrapper<any>> => {
    router = createRouter({
      history: createWebHistory(process.env.BASE_URL),
      routes: [{ path: '/', component: LoginPage }],
    });
    router.push('/');
    await router.isReady();
    return mount(LoginPage, {
      global: {
        plugins: [router],
      },
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays messages as the user enters invalid data', async () => {
    const wrapper = await mountView();
    const email = wrapper.findComponent('[data-testid="email-input"]');
    const password = wrapper.findComponent('[data-testid="password-input"]');
    const msg = wrapper.find('[data-testid="basic-form-error-message"]');

    await flushPromises();
    expect(msg.text()).toBe('');

    await email.setValue('foobar');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe('Email Address must be a valid email'));

    await email.setValue('');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe('Email Address is a required field'));

    await email.setValue('foobar@baz.com');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe(''));

    await password.setValue('mypassword');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe(''));

    await password.setValue('');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe('Password is a required field'));

    await password.setValue('mypassword');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe(''));
  });

  it('has a disabled signin button until valid data is entered', async () => {
    const wrapper = await mountView();
    const button = wrapper.find('[data-testid="basic-signin-button"]');
    const email = wrapper.findComponent('[data-testid="email-input"]');
    const password = wrapper.findComponent('[data-testid="password-input"]');

    await flushPromises();
    await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(true));

    await email.setValue('foobar');
    await flushPromises();
    await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(true));

    await password.setValue('mypassword');
    await flushPromises();
    await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(true));

    await email.setValue('foobar@baz.com');
    await flushPromises();
    await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(false));
  });

  describe('clicking on the signin button', () => {
    let wrapper: VueWrapper<any>;
    beforeEach(async () => {
      wrapper = await mountView();
      const email = wrapper.findComponent('[data-testid="email-input"]');
      const password = wrapper.findComponent('[data-testid="password-input"]');
      await email.setValue('test@test.com');
      await password.setValue('test');
    });

    it('initializes the vault unlock mode', async () => {
      const { initializeUnlockMode } = useSessionVault();
      const button = wrapper.find('[data-testid="basic-signin-button"]');
      await button.trigger('click');
      expect(initializeUnlockMode).toHaveBeenCalledTimes(1);
    });

    it('performs the login', async () => {
      const { login } = useAuth();
      const button = wrapper.find('[data-testid="basic-signin-button"]');
      await button.trigger('click');
      expect(login).toHaveBeenCalledTimes(1);
      expect(login).toHaveBeenCalledWith('Basic', 'test@test.com', 'test');
    });

    describe('if the login succeeds', () => {
      it('does not show an error', async () => {
        const button = wrapper.find('[data-testid="basic-signin-button"]');
        const msg = wrapper.find('[data-testid="error-message"]');
        await button.trigger('click');
        await flushPromises();
        expect(msg.text()).toBe('');
      });

      it('navigates to the root page', async () => {
        const button = wrapper.find('[data-testid="basic-signin-button"]');
        router.replace = jest.fn();
        await button.trigger('click');
        await flushPromises();
        expect(router.replace).toHaveBeenCalledTimes(1);
        expect(router.replace).toHaveBeenCalledWith('/');
      });
    });

    describe('if the login fails', () => {
      beforeEach(() => {
        const { login } = useAuth();
        (login as jest.Mock).mockRejectedValue(new Error('the login failed'));
      });

      it('shows an error', async () => {
        const button = wrapper.find('[data-testid="basic-signin-button"]');
        const msg = wrapper.find('[data-testid="error-message"]');
        button.trigger('click');
        await flushPromises();
        expect(msg.text()).toBe('Invalid email and/or password');
      });

      it('does not navigate', async () => {
        const button = wrapper.find('[data-testid="basic-signin-button"]');
        router.replace = jest.fn();
        button.trigger('click');
        await flushPromises();
        expect(router.replace).not.toHaveBeenCalled();
      });
    });
  });

  describe.each([['Auth0' as AuthProvider], ['AWS' as AuthProvider], ['Azure' as AuthProvider]])(
    '%s Login button',
    (provider: AuthProvider) => {
      let wrapper: VueWrapper<any>;
      const getButton = () => {
        switch (provider) {
          case 'AWS':
            return wrapper.find('[data-testid="aws-signin-button"]');
          case 'Auth0':
            return wrapper.find('[data-testid="auth0-signin-button"]');
          case 'Azure':
            return wrapper.find('[data-testid="azure-signin-button"]');
          default:
            throw new Error(`Invalid provider: ${provider}`);
        }
      };

      beforeEach(async () => {
        const { login } = useAuth();
        wrapper = await mountView();
        (login as jest.Mock).mockResolvedValue(undefined);
      });

      it('performs the login', async () => {
        const { login } = useAuth();
        const button = getButton();
        button.trigger('click');
        await flushPromises();
        expect(login).toHaveBeenCalledTimes(1);
        expect(login).toHaveBeenCalledWith(provider);
      });

      describe('if the login succeeds', () => {
        it('does not show an error', async () => {
          const button = getButton();
          const msg = wrapper.find('[data-testid="error-message"]');
          button.trigger('click');
          await flushPromises();
          expect(msg.text()).toBe('');
        });

        it('navigates to the root page', async () => {
          const button = getButton();
          router.replace = jest.fn();
          button.trigger('click');
          await flushPromises();
          expect(router.replace).toHaveBeenCalledTimes(1);
          expect(router.replace).toHaveBeenCalledWith('/');
        });
      });

      describe('if the login fails', () => {
        beforeEach(() => {
          const { login } = useAuth();
          (login as jest.Mock).mockRejectedValue(new Error('the login failed'));
        });

        it('shows an error', async () => {
          const button = getButton();
          const msg = wrapper.find('[data-testid="error-message"]');
          button.trigger('click');
          await flushPromises();
          expect(msg.text()).toBe('Invalid email and/or password');
        });

        it('does not navigate', async () => {
          const button = getButton();
          router.replace = jest.fn();
          button.trigger('click');
          await flushPromises();
          expect(router.replace).not.toHaveBeenCalled();
        });
      });
    }
  );
});
