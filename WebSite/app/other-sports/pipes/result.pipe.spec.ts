import { ResultPipe } from './result.pipe';

describe('Pipe: ResultPipe', () => {
  let pipe: ResultPipe;

  beforeEach(() => {
    pipe = new ResultPipe();
  });

  it('return - when value is empty', () => {
    expect(pipe.transform("")).toBe("-");
  });

  it('return correct input value', () => {
    expect(pipe.transform("1")).toBe("1");
  });

});
