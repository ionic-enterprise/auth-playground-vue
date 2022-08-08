import { mount, VueWrapper } from '@vue/test-utils';
import AboutPage from '@/views/AboutPage.vue';
import { createRouter, createWebHistory, Router } from 'vue-router';

let router: Router;

const mountView = async (): Promise<VueWrapper<any>> => {
  router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes: [{ path: '/', component: AboutPage }],
  });
  router.push('/');
  await router.isReady();
  return mount(AboutPage, {
    global: {
      plugins: [router],
    },
  });
};

describe('AboutPage.vue', () => {
  it('displays the title', async () => {
    const wrapper = await mountView();
    const titles = wrapper.findAll('ion-title');
    expect(titles).toHaveLength(1);
    expect(titles[0].text()).toBe('About');
  });
});
