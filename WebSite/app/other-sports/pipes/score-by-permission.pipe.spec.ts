import { ScoreByPermissionPipe } from './score-by-permission.pipe';
describe('Pipe: ScoreByPermissionPipe', () => {
  let pipe: ScoreByPermissionPipe;

  beforeEach(() => {
    pipe = new ScoreByPermissionPipe();
  });

  it('return - when value is null', () => {
    expect(pipe.transform("", 0, false)).toEqual("-");
  });

  it('return correct input value', () => {
    expect(pipe.transform("1", 4, true)).toEqual("1");
  });
});
