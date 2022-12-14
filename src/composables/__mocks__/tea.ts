import { Tea } from '@/models';
import { ref } from 'vue';

export default jest.fn().mockReturnValue({
  teas: ref<Array<Tea>>([]),
  find: jest.fn().mockResolvedValue(undefined),
  rate: jest.fn().mockResolvedValue(undefined),
  refresh: jest.fn().mockResolvedValue(false),
});
