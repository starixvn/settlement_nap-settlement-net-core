import { ResourceNameByIdPipe } from './resource-name-by-id.pipe';

describe('Pipe: resourceName', () => {
  let pipe: ResourceNameByIdPipe;
  beforeEach(() => {
    pipe = new ResourceNameByIdPipe();
  });

  it('providing resourceId = 00 returns name "Match"', () => {
    expect(pipe.transform("00")).toBe("Match");
  });

  it('providing resourceId = 01 returns name "Total Points"', () => {
    expect(pipe.transform("01")).toBe("Total Points");
  });

  it('providing any resourceId returns name "1G"', () => {
    expect(pipe.transform("0101")).toBe("Game 1");
  });
});
