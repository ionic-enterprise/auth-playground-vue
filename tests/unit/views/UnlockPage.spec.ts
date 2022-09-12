import { mount, VueWrapper } from '@vue/test-utils';
import UnlockPage from '@/views/UnlockPage.vue';
import { createRouter, createWebHistory, Router } from 'vue-router';

let router: Router;

const mountView = async (): Promise<VueWrapper<any>> => {
  router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes: [{ path: '/', component: UnlockPage }],
  });
  router.push('/');
  await router.isReady();
  return mount(UnlockPage, {
    global: {
      plugins: [router],
    },
  });
};

describe('UnlockPage.vue', () => {
  it('displays the title', async () => {
    const wrapper = await mountView();
    const titles = wrapper.findAll('ion-title');
    expect(titles).toHaveLength(2);
    expect(titles[0].text()).toBe('Unlock');
    expect(titles[1].text()).toBe('Unlock');
  });
});
