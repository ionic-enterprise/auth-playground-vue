import { Router } from 'vue-router';
import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import DeviceInfoPage from '@/views/DeviceInfoPage.vue';
import { createRouter, createWebHistory } from '@ionic/vue-router';
import {
  BiometricPermissionState,
  BiometricSecurityStrength,
  Device,
  SupportedBiometricType,
} from '@ionic-enterprise/identity-vault';
import { alertController, isPlatform } from '@ionic/vue';
import waitForExpect from 'wait-for-expect';

jest.mock('@/composables/auth');
jest.mock('@/composables/session-vault');
jest.mock('@ionic-enterprise/identity-vault');
jest.mock('@ionic/vue', () => {
  const actual = jest.requireActual('@ionic/vue');
  return { ...actual, isPlatform: jest.fn(), alertController: { create: jest.fn() } };
});

let router: Router;

const mountView = async (): Promise<VueWrapper<any>> => {
  router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes: [{ path: '/', component: DeviceInfoPage }],
  });
  router.push('/');
  await router.isReady();
  return mount(DeviceInfoPage, {
    global: {
      plugins: [router],
    },
  });
};

describe('DeviceInfoPage.vue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Device.hasSecureHardware as jest.Mock).mockResolvedValue(false);
    (Device.isBiometricsSupported as jest.Mock).mockResolvedValue(false);
    (Device.isBiometricsEnabled as jest.Mock).mockResolvedValue(false);
    (Device.isBiometricsAllowed as jest.Mock).mockResolvedValue(BiometricPermissionState.Denied);
    (Device.getBiometricStrengthLevel as jest.Mock).mockResolvedValue(BiometricSecurityStrength.Weak);
    (Device.isSystemPasscodeSet as jest.Mock).mockResolvedValue(false);
    (Device.isHideScreenOnBackgroundEnabled as jest.Mock).mockResolvedValue(false);
    (Device.isLockedOutOfBiometrics as jest.Mock).mockResolvedValue(false);
    (Device.getAvailableHardware as jest.Mock).mockResolvedValue([]);
  });

  it('displays the title', async () => {
    const wrapper = await mountView();
    const titles = wrapper.findAll('ion-title');
    expect(titles).toHaveLength(2);
    expect(titles[0].text()).toBe('Device Information');
    expect(titles[1].text()).toBe('Device Information');
  });

  it.each([[true], [false]])('has secure hardware displays %s', async (value: boolean) => {
    (Device.hasSecureHardware as jest.Mock).mockResolvedValue(value);
    const wrapper = await mountView();
    const item = wrapper.findComponent('[data-testid="has-secure-hardware"]');
    const note = item.findComponent('ion-note');
    expect(note.text()).toEqual(value.toString());
  });

  it.each([[true], [false]])('biometrics supported displays %s', async (value: boolean) => {
    (Device.isBiometricsSupported as jest.Mock).mockResolvedValue(value);
    const wrapper = await mountView();
    const item = wrapper.findComponent('[data-testid="biometrics-supported"]');
    const note = item.findComponent('ion-note');
    expect(note.text()).toEqual(value.toString());
  });

  it.each([[true], [false]])('biometrics enabled displays %s', async (value: boolean) => {
    (Device.isBiometricsEnabled as jest.Mock).mockResolvedValue(value);
    const wrapper = await mountView();
    const item = wrapper.findComponent('[data-testid="biometrics-enabled"]');
    const note = item.findComponent('ion-note');
    expect(note.text()).toEqual(value.toString());
  });

  it.each([[BiometricPermissionState.Denied], [BiometricPermissionState.Prompt], [BiometricPermissionState.Granted]])(
    'biometrics allowed displays %s',
    async (value: BiometricPermissionState) => {
      (Device.isBiometricsAllowed as jest.Mock).mockResolvedValue(value);
      const wrapper = await mountView();
      const item = wrapper.findComponent('[data-testid="biometrics-allowed"]');
      const note = item.findComponent('ion-note');
      expect(note.text()).toEqual(value.toString());
    }
  );

  it.each([[BiometricSecurityStrength.Weak], [BiometricSecurityStrength.Strong]])(
    'biometrics allowed displays %s',
    async (value: BiometricSecurityStrength) => {
      (Device.getBiometricStrengthLevel as jest.Mock).mockResolvedValue(value);
      const wrapper = await mountView();
      const item = wrapper.findComponent('[data-testid="biometric-security-strength"]');
      const note = item.findComponent('ion-note');
      expect(note.text()).toEqual(value.toString());
    }
  );

  it.each([[true], [false]])('system passcode displays %s', async (value: boolean) => {
    (Device.isSystemPasscodeSet as jest.Mock).mockResolvedValue(value);
    const wrapper = await mountView();
    const item = wrapper.findComponent('[data-testid="system-passcode"]');
    const note = item.findComponent('ion-note');
    expect(note.text()).toEqual(value.toString());
  });

  it.each([[true], [false]])('privacy screen displays %s', async (value: boolean) => {
    (Device.isHideScreenOnBackgroundEnabled as jest.Mock).mockResolvedValue(value);
    const wrapper = await mountView();
    const item = wrapper.findComponent('[data-testid="privacy-screen"]');
    const note = item.findComponent('ion-note');
    expect(note.text()).toEqual(value.toString());
  });

  it.each([[true], [false]])('locked out displays %s', async (value: boolean) => {
    (Device.isLockedOutOfBiometrics as jest.Mock).mockResolvedValue(value);
    const wrapper = await mountView();
    const item = wrapper.findComponent('[data-testid="locked-out"]');
    const note = item.findComponent('ion-note');
    expect(note.text()).toEqual(value.toString());
  });

  describe('toggle privacy screen button', () => {
    describe('on web', () => {
      beforeEach(() => {
        (isPlatform as jest.Mock).mockReturnValue(false);
      });

      it('is disabled', async () => {
        const wrapper = await mountView();
        const button = wrapper.findComponent('[data-testid="toggle-privacy-screen-button"]');
        await flushPromises();
        await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(true));
      });
    });

    describe('on mobile', () => {
      beforeEach(() => {
        (isPlatform as jest.Mock).mockReturnValue(true);
      });

      it('is enabled', async () => {
        const wrapper = await mountView();
        const button = wrapper.findComponent('[data-testid="toggle-privacy-screen-button"]');
        await flushPromises();
        await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(false));
      });

      it('toggles the privacy screen', async () => {
        const wrapper = await mountView();
        const button = wrapper.findComponent('[data-testid="toggle-privacy-screen-button"]');
        (Device.isHideScreenOnBackgroundEnabled as jest.Mock).mockClear();
        (Device.isHideScreenOnBackgroundEnabled as jest.Mock).mockResolvedValue(true);
        await button.trigger('click');
        expect(Device.setHideScreenOnBackground).toHaveBeenCalledTimes(1);
        expect(Device.setHideScreenOnBackground).toHaveBeenCalledWith(true);
        expect(Device.isHideScreenOnBackgroundEnabled).toHaveReturnedTimes(1);
        await flushPromises();
        (Device.setHideScreenOnBackground as jest.Mock).mockClear();
        await button.trigger('click');
        expect(Device.setHideScreenOnBackground).toHaveBeenCalledTimes(1);
        expect(Device.setHideScreenOnBackground).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('show biometrics prompt', () => {
    describe('on web', () => {
      beforeEach(() => {
        (isPlatform as jest.Mock).mockReturnValue(false);
      });

      it('is disabled', async () => {
        const wrapper = await mountView();
        const button = wrapper.findComponent('[data-testid="show-biometric-prompt-button"]');
        await flushPromises();
        await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(true));
      });
    });

    describe('on mobile', () => {
      const alert = { present: jest.fn().mockResolvedValue(undefined) };
      beforeEach(() => {
        (isPlatform as jest.Mock).mockReturnValue(true);
        (alertController.create as jest.Mock).mockResolvedValueOnce(alert);
      });

      it('is enabled', async () => {
        const wrapper = await mountView();
        const button = wrapper.findComponent('[data-testid="show-biometric-prompt-button"]');
        await flushPromises();
        await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(false));
      });

      it('shows the biometric prompt', async () => {
        const wrapper = await mountView();
        const button = wrapper.findComponent('[data-testid="show-biometric-prompt-button"]');
        await button.trigger('click');
        expect(Device.showBiometricPrompt).toHaveBeenCalledTimes(1);
        expect(Device.showBiometricPrompt).toHaveBeenCalledWith({
          iosBiometricsLocalizedReason: 'This is only a test',
        });
      });

      describe('on success', () => {
        it('shows a success alert', async () => {
          const wrapper = await mountView();
          const button = wrapper.findComponent('[data-testid="show-biometric-prompt-button"]');
          await button.trigger('click');
          await flushPromises();
          expect(alertController.create).toHaveBeenCalledTimes(1);
          expect(alertController.create).toHaveBeenCalledWith({
            header: 'Show Biometrics',
            subHeader: 'Success!!',
          });
          expect(alert.present).toHaveBeenCalledTimes(1);
        });
      });

      describe('on failure', () => {
        beforeEach(() => {
          (Device.showBiometricPrompt as jest.Mock).mockRejectedValue(new Error('Cancel the thing!'));
        });

        it('shows a failure alert', async () => {
          const wrapper = await mountView();
          const button = wrapper.findComponent('[data-testid="show-biometric-prompt-button"]');
          await button.trigger('click');
          await flushPromises();
          expect(alertController.create).toHaveBeenCalledTimes(1);
          expect(alertController.create).toHaveBeenCalledWith({
            header: 'Show Biometrics',
            subHeader: 'Failed. User likely cancelled the operation.',
          });
          expect(alert.present).toHaveBeenCalledTimes(1);
        });
      });
    });
  });

  describe('available hardware list', () => {
    it('shows none if there are none', async () => {
      const wrapper = await mountView();
      const section = wrapper.find('[data-testid="available-hardware"]');
      const items = section.findAll('li');
      expect(items.length).toEqual(1);
      expect(items[0].text()).toEqual('None');
    });

    it('shows all of the defined hardware if it exists', async () => {
      (Device.getAvailableHardware as jest.Mock).mockResolvedValue([
        SupportedBiometricType.Fingerprint,
        SupportedBiometricType.Face,
      ]);
      const wrapper = await mountView();
      const section = wrapper.find('[data-testid="available-hardware"]');
      const items = section.findAll('li');
      expect(items.length).toEqual(2);
      expect(items[0].text()).toEqual('fingerprint');
      expect(items[1].text()).toEqual('face');
    });
  });
});
