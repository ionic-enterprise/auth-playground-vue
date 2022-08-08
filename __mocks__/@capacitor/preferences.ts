export const Preferences = {
  get: jest.fn().mockResolvedValue({ value: undefined }),
  set: jest.fn().mockResolvedValue(undefined),
  remove: jest.fn().mockResolvedValue(undefined),
  clear: jest.fn().mockResolvedValue(undefined),
};
