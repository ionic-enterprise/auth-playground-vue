import AppPinDialog from '@/components/AppPinDialog.vue';
import { flushPromises, mount, VueWrapper } from '@vue/test-utils';

describe('AppPinDialog', () => {
  const createComponent = (setPasscodeMode = false): VueWrapper<any> => {
    return mount(AppPinDialog as any, { props: { setPasscodeMode } });
  };

  it('renders', () => {
    const wrapper = createComponent();
    expect(wrapper.exists()).toBe(true);
  });

  describe('entering a new PIN', () => {
    let wrapper: VueWrapper<any>;
    beforeEach(() => {
      wrapper = createComponent(true);
    });

    it('sets the title to "Create PIN"', () => {
      const title = wrapper.find('ion-title');
      expect(title.text()).toEqual('Create PIN');
    });

    it('sets the prompt to "Create Session PIN"', () => {
      const prompt = wrapper.find('[data-testid="prompt"]');
      expect(prompt.text()).toEqual('Create Session PIN');
    });

    it('adds markers for each button press, stopping after nine', async () => {
      const pin = wrapper.find('[data-testid="display-pin"]');
      const buttons = wrapper.findAll('[data-testclass="number-button"]');
      buttons[0].trigger('click');
      await flushPromises();
      expect(pin.text()).toEqual('*');
      buttons[3].trigger('click');
      await flushPromises();
      expect(pin.text()).toEqual('**');
      buttons[1].trigger('click');
      await flushPromises();
      expect(pin.text()).toEqual('***');
      buttons[8].trigger('click');
      await flushPromises();
      expect(pin.text()).toEqual('****');
      for (let x = 0; x < 4; x++) {
        buttons[6].trigger('click');
        await flushPromises();
      }
      expect(pin.text()).toEqual('********');
      buttons[9].trigger('click');
      await flushPromises();
      expect(pin.text()).toEqual('*********');
      for (let x = 0; x < 4; x++) {
        buttons[3].trigger('click');
        await flushPromises();
        expect(pin.text()).toEqual('*********');
      }
    });

    describe('pressing delete', () => {
      it('removes a marker', async () => {
        const pin = wrapper.find('[data-testid="display-pin"]');
        const deleteButton = wrapper.find('[data-testid="delete-button"]');
        const buttons = wrapper.findAll('[data-testclass="number-button"]');
        for (let x = 0; x < 4; x++) {
          buttons[6].trigger('click');
          await flushPromises();
        }
        expect(pin.text()).toEqual('****');
        deleteButton.trigger('click');
        await flushPromises();
        expect(pin.text()).toEqual('***');
      });
    });

    describe('pressing enter', () => {
      it('asks for re-entry', async () => {
        const pin = wrapper.find('[data-testid="display-pin"]');
        const enterButton = wrapper.find('[data-testid="enter-button"]');
        const buttons = wrapper.findAll('[data-testclass="number-button"]');
        const prompt = wrapper.find('[data-testid="prompt"]');
        buttons[0].trigger('click');
        await flushPromises();
        buttons[3].trigger('click');
        await flushPromises();
        buttons[1].trigger('click');
        await flushPromises();
        buttons[8].trigger('click');
        await flushPromises();
        expect(pin.text()).toEqual('****');
        enterButton.trigger('click');
        await flushPromises();
        expect(pin.text()).toEqual('');
        expect(prompt.text()).toEqual('Verify PIN');
      });
    });
  });

  describe('entering a PIN to unlock the vault', () => {
    let wrapper: VueWrapper<any>;
    beforeEach(() => {
      wrapper = createComponent(false);
    });

    it('sets the title to "Unlock"', () => {
      const title = wrapper.find('ion-title');
      expect(title.text()).toEqual('Unlock');
    });

    it('sets the prompt to "Enter PIN to Unlock"', () => {
      const prompt = wrapper.find('[data-testid="prompt"]');
      expect(prompt.text()).toEqual('Enter PIN to Unlock');
    });

    it('adds markers for each button press, stopping after nine', async () => {
      const pin = wrapper.find('[data-testid="display-pin"]');
      const buttons = wrapper.findAll('[data-testclass="number-button"]');
      buttons[0].trigger('click');
      await flushPromises();
      expect(pin.text()).toEqual('*');
      buttons[3].trigger('click');
      await flushPromises();
      expect(pin.text()).toEqual('**');
      buttons[1].trigger('click');
      await flushPromises();
      expect(pin.text()).toEqual('***');
      buttons[8].trigger('click');
      await flushPromises();
      expect(pin.text()).toEqual('****');
      for (let x = 0; x < 4; x++) {
        buttons[6].trigger('click');
        await flushPromises();
      }
      expect(pin.text()).toEqual('********');
      buttons[9].trigger('click');
      await flushPromises();
      expect(pin.text()).toEqual('*********');
      for (let x = 0; x < 4; x++) {
        buttons[3].trigger('click');
        await flushPromises();
        expect(pin.text()).toEqual('*********');
      }
    });

    describe('pressing delete', () => {
      it('removes a marker', async () => {
        const pin = wrapper.find('[data-testid="display-pin"]');
        const deleteButton = wrapper.find('[data-testid="delete-button"]');
        const buttons = wrapper.findAll('[data-testclass="number-button"]');
        for (let x = 0; x < 4; x++) {
          buttons[6].trigger('click');
          await flushPromises();
        }
        expect(pin.text()).toEqual('****');
        deleteButton.trigger('click');
        await flushPromises();
        expect(pin.text()).toEqual('***');
      });
    });
  });
});
