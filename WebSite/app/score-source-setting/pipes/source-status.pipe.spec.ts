import { SourceStatusPipe } from './source-status.pipe';

describe('Pipe: SourceStatusPipe', () => {
  let pipe: SourceStatusPipe;
  beforeEach(() => {
    pipe = new SourceStatusPipe();
  });

  it('return "Active" when input true', () => {
    expect(pipe.transform(true)).toBe("Active");
  });

  it('return "Inactive" when input false', () => {
    expect(pipe.transform(false)).toBe("Inactive");
  });
});
