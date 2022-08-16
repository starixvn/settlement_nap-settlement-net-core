import { ResourceHeaderPipe } from './resource-header.pipe';

describe('Pipe: ResourceHeaderPipe', () => {
  let pipe: ResourceHeaderPipe;

  beforeEach(() => {
    pipe = new ResourceHeaderPipe();
  });

  it('return Total Points when resourceId is 01', () => {
    expect(pipe.transform("01")).toBe("Total Points");
  });

  
  it('return Total Sets when resourceId is 00', () => {
    expect(pipe.transform("00")).toBe("Total Sets");
  });

  it('return set number on resourceId', () => {
    expect(pipe.transform("2001")).toBe("1S");
  });

});
