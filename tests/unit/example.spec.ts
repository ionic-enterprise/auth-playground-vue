import { mount } from '@vue/test-utils';
import TeasPage from '@/views/TeasPage.vue';

describe('TeasPage.vue', () => {
  it('renders', () => {
    const wrapper = mount(TeasPage);
    expect(wrapper.text()).toMatch('Tab 1 page');
  });
});
