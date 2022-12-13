export const useSessionVault = jest.fn().mockReturnValue({
  canUnlock: jest.fn().mockResolvedValue(false),
  initializeUnlockMode: jest.fn().mockResolvedValue(undefined),
  setUnlockMode: jest.fn().mockResolvedValue(undefined),
  getConfig: jest.fn().mockReturnValue({}),
  getKeys: jest.fn().mockResolvedValue([]),
  getValue: jest.fn().mockResolvedValue({ value: null }),
  setValue: jest.fn().mockResolvedValue(undefined),
  clear: jest.fn().mockResolvedValue(undefined),
  lock: jest.fn().mockResolvedValue(undefined),
  unlock: jest.fn().mockResolvedValue(undefined),
});
