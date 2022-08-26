import { ScorePipe } from './score.pipe';

describe('Pipe: ScorePipe', () => {
  let pipe: ScorePipe;

  beforeEach(() => {
    pipe = new ScorePipe();
  });

  it('return - when value is null', () => {
    expect(pipe.transform(null)).toBe("-");
  });

  it('return correct input value', () => {
    expect(pipe.transform(1)).toBe(1);
  });

});
