import { ResourceNameByIdPipe } from './resource-name-by-id.pipe';

describe('Pipe: ResourceNameByIdPipe', () => {
  let pipe: ResourceNameByIdPipe;

  beforeEach(() => {
    pipe = new ResourceNameByIdPipe();
  });

  it('return Total Sets when resourceId is 00', () => {
    expect(pipe.transform("00")).toBe("Total Sets");
  });

  it('return set number on resourceId', () => {
    expect(pipe.transform("2001")).toBe("Set 1");
  });

});
