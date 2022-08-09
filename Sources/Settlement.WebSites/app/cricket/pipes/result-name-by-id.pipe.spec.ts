import { ResultNameByIdPipe } from './result-name-by-id.pipe';
import { MatchDetail } from '../models';

describe('Pipe: ResultNameByIdPipe', () => {
  let pipe: ResultNameByIdPipe;
  const matchDetail = new MatchDetail();

  beforeEach(() => {
    pipe = new ResultNameByIdPipe();
    matchDetail.awayName = '1';
    matchDetail.homeName = '2';
  });

  it('return Match Winner when resourcesId is "00"', () => {
    expect(pipe.transform("00", matchDetail)).toBe("Match Winner");
  });

  it('return Innings AwayName when resourcesId is "A1"', () => {
    expect(pipe.transform("A1", matchDetail)).toBe("Innings 1 - 1");
  });

  it('return Innings HomeName when resourcesId is "H1"', () => {
    expect(pipe.transform("H1", matchDetail)).toBe("Innings 1 - 2");
  });

});
