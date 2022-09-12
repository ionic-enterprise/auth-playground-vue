import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import StartPage from '@/views/StartPage.vue';
import { createRouter, createWebHistory, Router } from 'vue-router';
import useSessionVault from '@/composables/session-vault';

jest.mock('@/composables/session-vault');

let router: Router;

const mountView = async (): Promise<VueWrapper<any>> => {
  router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes: [{ path: '/', component: StartPage }],
  });
  router.push('/');
  await router.isReady();
  router.replace = jest.fn();
  return mount(StartPage, {
    global: {
      plugins: [router],
    },
  });
};

describe('StartPage.vue', () => {
  it('routes to the teas when we cannot unlock', async () => {
    const { canUnlock } = useSessionVault();
    (canUnlock as jest.Mock).mockResolvedValue(false);
    await mountView();
    await flushPromises();
    expect(router.replace).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith('/tabs/teas');
  });

  it('routes to the unlock page when we can unlock', async () => {
    const { canUnlock } = useSessionVault();
    (canUnlock as jest.Mock).mockResolvedValue(true);
    await mountView();
    await flushPromises();
    expect(router.replace).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith('/unlock');
  });
});
