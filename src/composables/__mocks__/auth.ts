export default jest.fn().mockReturnValue({
  login: jest.fn().mockResolvedValue(undefined),
  logout: jest.fn().mockResolvedValue(undefined),
  isAuthenticated: jest.fn().mockResolvedValue(false),
  getAccessToken: jest.fn().mockResolvedValue(''),
});
