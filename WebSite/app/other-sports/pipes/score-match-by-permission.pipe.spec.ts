import { ScoreMatchByPermissionPipe } from './score-match-by-permission.pipe';
import { MatchDetail } from '../models';
describe('Pipe: ScoreMatchByPermissionPipe', () => {
  let pipe: ScoreMatchByPermissionPipe;

  beforeEach(() => {
    pipe = new ScoreMatchByPermissionPipe();
  });

  it('return - when value is null', () => {
      const matchDetail = {} as MatchDetail;
    expect(pipe.transform("", matchDetail, false)).toEqual("-");
  });

  it('return correct input value', () => {
    const matchDetail = {} as MatchDetail;
    matchDetail.isCalculated = true;
    expect(pipe.transform("1", matchDetail, true)).toEqual("1");
  });
});
