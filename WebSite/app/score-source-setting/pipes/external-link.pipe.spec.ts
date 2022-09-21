import { ExternalLinkPipe } from './external-link.pipe';

describe('Pipe: ExternalLinkPipe', () => {
  let pipe: ExternalLinkPipe;
  beforeEach(() => {
    pipe = new ExternalLinkPipe();
  });

  it('return empty when url is empty', () => {
    expect(pipe.transform('')).toEqual('');
  });

  it('return url when url is valid', () => {
    expect(pipe.transform('http://abc.com')).toEqual('http://abc.com');
  });

  it('add "http" when url missing it', () => {
    expect(pipe.transform('test.com')).toEqual('http://test.com');
  });
});