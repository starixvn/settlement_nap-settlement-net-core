import { ResourceHeaderPipe } from './resource-header.pipe';

describe('Pipe: ResourceHeader', () => {
  let pipe: ResourceHeaderPipe;
  beforeEach(() => {
    pipe = new ResourceHeaderPipe();
  });

  it('providing resourceId = 01 returns name "Total Points"', () => {
    expect(pipe.transform("01")).toBe("Total Points");
  });

  it('providing resourceId = 00 returns name "Total Games"', () => {
    expect(pipe.transform("00")).toBe("Total Games");
  });

  it('providing any resourceId returns name "1G"', () => {
    expect(pipe.transform("0101")).toBe("1G");
  });
});
