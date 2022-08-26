import { ResourceNameByIdPipe } from './resource-name-by-id.pipe';

describe('Pipe: resourceName', () => {
  let pipe: ResourceNameByIdPipe;
  beforeEach(() => {
    pipe = new ResourceNameByIdPipe();
  });

  it('providing resourceId = 00 returns name "Match"', () => {
    expect(pipe.transform("00")).toBe("Match");
  });

  it('providing any resourceId returns name "Set 1"', () => {
    expect(pipe.transform("01")).toBe("Set 1");
  });
});
