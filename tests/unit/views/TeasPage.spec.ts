import { mount, VueWrapper } from '@vue/test-utils';
import TeasPage from '@/views/TeasPage.vue';
import { createRouter, createWebHistory, Router } from 'vue-router';

let router: Router;

const mountView = async (): Promise<VueWrapper<any>> => {
  router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes: [{ path: '/', component: TeasPage }],
  });
  router.push('/');
  await router.isReady();
  return mount(TeasPage, {
    global: {
      plugins: [router],
    },
  });
};

describe('TeasPage.vue', () => {
  it('displays the title', async () => {
    const wrapper = await mountView();
    const titles = wrapper.findAll('ion-title');
    expect(titles).toHaveLength(2);
    expect(titles[0].text()).toBe('Teas');
    expect(titles[1].text()).toBe('Teas');
  });
});
