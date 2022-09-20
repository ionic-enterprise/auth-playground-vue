import { Router } from 'vue-router';
import { mount, VueWrapper } from '@vue/test-utils';
import ValueListPage from '@/views/ValueListPage.vue';
import { createRouter, createWebHistory } from '@ionic/vue-router';

jest.mock('@/composables/auth');
jest.mock('@/composables/session-vault');

let router: Router;

const mountView = async (): Promise<VueWrapper<any>> => {
  router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes: [{ path: '/', component: ValueListPage }],
  });
  router.push('/');
  await router.isReady();
  return mount(ValueListPage, {
    global: {
      plugins: [router],
    },
  });
};

describe('ValueListPage.vue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays the title', async () => {
    const wrapper = await mountView();
    const titles = wrapper.findAll('ion-title');
    expect(titles).toHaveLength(2);
    expect(titles[0].text()).toBe('Stored Values');
    expect(titles[1].text()).toBe('Stored Values');
  });
});
