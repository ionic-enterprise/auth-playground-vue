import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import UnlockPage from '@/views/UnlockPage.vue';
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { useAuth } from '@/composables/auth';
import { useSessionVault } from '@/composables/session-vault';
import { Router } from 'vue-router';

jest.mock('@/composables/auth');
jest.mock('@/composables/session-vault');

let router: Router;
const mountView = async (): Promise<VueWrapper<any>> => {
  router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes: [{ path: '/', component: UnlockPage }],
  });
  router.push('/');
  await router.isReady();
  router.replace = jest.fn().mockResolvedValue(undefined);
  return mount(UnlockPage, {
    global: {
      plugins: [router],
    },
  });
};

describe('UnlockPage.vue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays an unlock prompt', async () => {
    const wrapper = await mountView();
    const prompt = wrapper.find('[data-testid="unlock-button"]');
    expect(prompt.text()).toBe('Unlock');
  });

  it('displays a redo login prompt', async () => {
    const wrapper = await mountView();
    const prompt = wrapper.find('[data-testid="redo-button"]');
    expect(prompt.text()).toBe('Redo Sign In');
  });

  describe('the unlock button', () => {
    describe('while the user can unlock', () => {
      beforeEach(() => {
        const { canUnlock } = useSessionVault();
        (canUnlock as jest.Mock).mockResolvedValue(true);
      });

      it('unlocks the vault', async () => {
        const { unlock } = useSessionVault();
        const wrapper = await mountView();
        const button = wrapper.find('[data-testid="unlock-button"]');
        await button.trigger('click');
        await flushPromises();
        expect(unlock).toHaveBeenCalledTimes(1);
      });

      it('navigates to the root', async () => {
        const wrapper = await mountView();
        const button = wrapper.find('[data-testid="unlock-button"]');
        await button.trigger('click');
        await flushPromises();
        expect(router.replace).toHaveBeenCalledTimes(1);
        expect(router.replace).toHaveBeenCalledWith('/');
      });

      describe('when the user cancels', () => {
        it('does not navigate', async () => {
          const { unlock } = useSessionVault();
          (unlock as jest.Mock).mockRejectedValue(new Error('whatever, dude'));
          const wrapper = await mountView();
          const button = wrapper.find('[data-testid="unlock-button"]');
          await button.trigger('click');
          await flushPromises();
          expect(router.replace).not.toHaveBeenCalled();
        });
      });
    });

    describe('when the user can no longer unlock', () => {
      beforeEach(() => {
        const { canUnlock } = useSessionVault();
        (canUnlock as jest.Mock).mockResolvedValue(false);
      });

      it('unlocks the vault', async () => {
        const { unlock } = useSessionVault();
        const wrapper = await mountView();
        const button = wrapper.find('[data-testid="unlock-button"]');
        await button.trigger('click');
        await flushPromises();
        expect(unlock).not.toHaveBeenCalled();
      });

      it('navigates to the login', async () => {
        const wrapper = await mountView();
        const button = wrapper.find('[data-testid="unlock-button"]');
        await button.trigger('click');
        await flushPromises();
        expect(router.replace).toHaveBeenCalledTimes(1);
        expect(router.replace).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('the redo button', () => {
    it('performs a logout', async () => {
      const { logout } = useAuth();
      const wrapper = await mountView();
      const button = wrapper.find('[data-testid="redo-button"]');
      await button.trigger('click');
      expect(logout).toHaveBeenCalledTimes(1);
    });

    it('navigates to the login page', async () => {
      const wrapper = await mountView();
      const button = wrapper.find('[data-testid="redo-button"]');
      await button.trigger('click');
      expect(router.replace).toHaveBeenCalledTimes(1);
      expect(router.replace).toHaveBeenCalledWith('/login');
    });
  });
});
