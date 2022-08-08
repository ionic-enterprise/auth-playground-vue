import { BiometricPermissionState, Device, DeviceSecurityType, VaultType } from '@ionic-enterprise/identity-vault';
import useVaultFactory from '@/composables/vault-factory';
import router from '@/router';
import { isPlatform, modalController } from '@ionic/vue';
import AppPinDialog from '@/components/AppPinDialog.vue';
import { Preferences } from '@capacitor/preferences';
import { VaultConfig } from '@ionic-enterprise/identity-vault/dist/typings/definitions';

export type UnlockMode = 'Device' | 'SystemPIN' | 'SessionPIN' | 'NeverLock' | 'ForceLogin';

const modeKey = 'LastUnlockMode';

const { createVault } = useVaultFactory();
const vault = createVault({
  key: 'io.ionic.auth-playground-vue',
  type: VaultType.SecureStorage,
  deviceSecurityType: DeviceSecurityType.None,
  lockAfterBackgrounded: 5000,
  shouldClearVaultAfterTooManyFailedAttempts: true,
  customPasscodeInvalidUnlockAttempts: 2,
  unlockVaultOnLoad: false,
});

vault.onPasscodeRequested(async (isPasscodeSetRequest: boolean) => {
  const modal = await modalController.create({
    backdropDismiss: false,
    component: AppPinDialog,
    componentProps: {
      setPasscodeMode: isPasscodeSetRequest,
    },
  });
  await modal.present();
  const { data } = await modal.onDidDismiss();
  vault.setCustomPasscode(data || '');
});

const provision = async (): Promise<void> => {
  if ((await Device.isBiometricsAllowed()) === BiometricPermissionState.Prompt) {
    try {
      await Device.showBiometricPrompt({ iosBiometricsLocalizedReason: 'Please authenticate to continue' });
    } catch (error) {
      null;
    }
  }
};

const setUnlockMode = async (unlockMode: UnlockMode): Promise<void> => {
  let type: VaultType;
  let deviceSecurityType: DeviceSecurityType;

  switch (unlockMode) {
    case 'Device':
      await provision();
      type = VaultType.DeviceSecurity;
      deviceSecurityType = DeviceSecurityType.Both;
      break;

    case 'SystemPIN':
      type = VaultType.DeviceSecurity;
      deviceSecurityType = DeviceSecurityType.SystemPasscode;
      break;

    case 'SessionPIN':
      type = VaultType.CustomPasscode;
      deviceSecurityType = DeviceSecurityType.None;
      break;

    case 'ForceLogin':
      type = VaultType.InMemory;
      deviceSecurityType = DeviceSecurityType.None;
      break;

    case 'NeverLock':
      type = VaultType.SecureStorage;
      deviceSecurityType = DeviceSecurityType.None;
      break;

    default:
      type = VaultType.SecureStorage;
      deviceSecurityType = DeviceSecurityType.None;
  }

  await vault.updateConfig({
    ...vault.config,
    type,
    deviceSecurityType,
  });
  await Preferences.set({ key: modeKey, value: unlockMode });
};

const initializeUnlockMode = async (): Promise<void> => {
  if (isPlatform('hybrid')) {
    if (await Device.isSystemPasscodeSet()) {
      if (await Device.isBiometricsEnabled()) {
        await setUnlockMode('Device');
      } else {
        await setUnlockMode('SystemPIN');
      }
    } else {
      await setUnlockMode('SessionPIN');
    }
  }
};

const canUnlock = async (): Promise<boolean> => {
  const { value } = await Preferences.get({ key: modeKey });
  return value !== 'NeverLock' && !(await vault.isEmpty()) && (await vault.isLocked());
};

const getConfig = (): Promise<VaultConfig> => vault.config;
const getKeys = async (): Promise<Array<string>> => vault.getKeys();

const getValue = async <T>(key: string): Promise<T | undefined> => vault.getValue(key);
const setValue = async <T>(key: string, value: T): Promise<void> => vault.setValue(key, value);

const lock = async (): Promise<void> => vault.lock();
const unlock = async (): Promise<void> => vault.unlock();

const tokenStorage = {
  clear(): Promise<void> {
    return vault.clear();
  },

  getAccessToken(name?: string): Promise<string | undefined> {
    return vault.getValue(`AccessToken${name || ''}`);
  },

  getAuthResponse(): Promise<any> {
    return vault.getValue('AuthResponse');
  },

  async getIdToken(): Promise<string | undefined> {
    return vault.getValue('IdToken');
  },

  getRefreshToken(): Promise<string | undefined> {
    return vault.getValue('RefreshToken');
  },

  onLock() {
    null;
  },

  setAccessToken(token: string, name?: string): Promise<void> {
    return vault.setValue(`AccessToken${name || ''}`, token);
  },

  setAuthResponse(res: any): Promise<void> {
    return vault.setValue('AuthResponse', res);
  },

  setIdToken(token: string): Promise<void> {
    return vault.setValue('IdToken', token);
  },

  setRefreshToken(token: string): Promise<void> {
    return vault.setValue('RefreshToken', token);
  },
};

export default () => ({
  canUnlock,
  initializeUnlockMode,
  setUnlockMode,

  getConfig,
  getKeys,

  getValue,
  setValue,

  lock,
  unlock,

  tokenStorage,
});
