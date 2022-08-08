import { ResourceNameByIdPipe } from './resource-name-by-id.pipe';

describe('Pipe: ResourceNameByIdPipe', () => {
  let pipe: ResourceNameByIdPipe;
  beforeEach(() => {
    pipe = new ResourceNameByIdPipe();
  });

  it('return "Map 1" when input "M1"', () => {
    expect(pipe.transform("M1")).toBe("Map 1");
  });

  it('return "Full Time" when input "00"', () => {
    expect(pipe.transform("00")).toBe("Full Time");
  });
});
