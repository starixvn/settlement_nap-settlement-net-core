import { ResourceHeaderPipe } from './resource-header.pipe';

describe('Pipe: ResourceHeader', () => {
  let pipe: ResourceHeaderPipe;
  beforeEach(() => {
    pipe = new ResourceHeaderPipe();
  });

  it('providing resourceId = 06 returns name "Total Games"', () => {
    expect(pipe.transform("06")).toBe("Total Games");
  });

  it('providing resourceId = 00 returns name "Total Sets"', () => {
    expect(pipe.transform("00")).toBe("Total Sets");
  });

  it('providing any resourceId returns name "1S"', () => {
    expect(pipe.transform("01")).toBe("1S");
  });
});
