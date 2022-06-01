import { ExternalSourceNamePipe } from './external-source-name.pipe';

describe('Pipe: ExternalSourceNamePipe', () => {
  let pipe: ExternalSourceNamePipe;
  beforeEach(() => {
    pipe = new ExternalSourceNamePipe();
  });

  it('return "-" when input empty', () => {
    expect(pipe.transform("")).toBe("-");
  });

  it('return source name when input is not empty', () => {
    expect(pipe.transform("abc")).toBe("abc");
  });
});
