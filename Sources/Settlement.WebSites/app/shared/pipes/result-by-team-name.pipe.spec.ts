import { ResultByTeamNamePipe } from './result-by-team-name.pipe';
import { MatchDetail } from '../models/sportsbook-sop';

describe('Pipe: ResultByTeamNamePipe', () => {
  let pipe: ResultByTeamNamePipe;
  const matchDetail = new MatchDetail();
  matchDetail.homeName = 'home';
  matchDetail.awayName = 'away';

  beforeEach(() => {
    pipe = new ResultByTeamNamePipe();
  });

  it('return home name when result is "H"', () => {
    expect(pipe.transform("H", matchDetail, 0)).toBe("home");
  });

  it('return away name when result is "A"', () => {
    expect(pipe.transform("A", matchDetail, 0)).toBe("away");
  });

  it('return "Draw" when result is "D"', () => {
    expect(pipe.transform("D", matchDetail, 0)).toBe("Draw");
  });

  it('return "None" when result is "N" and bet type group is not "0"', () => {
    expect(pipe.transform("N", matchDetail, 0)).toBe("None");
  });

  it('return "No" when result is "N" and bet type group is "3"', () => {
    expect(pipe.transform("N", matchDetail, 3)).toBe("No");
  });

  it('return "Yes" when result is "Y"', () => {
    expect(pipe.transform("Y", matchDetail, 0)).toBe("Yes");
  });

  it('return result when result is not defined', () => {
    expect(pipe.transform("test", matchDetail, 0)).toBe("test");
  });

  it('return "-" when result is null or empty', () => {
    expect(pipe.transform(null, matchDetail, 0)).toBe("-");
    expect(pipe.transform("", matchDetail, 0)).toBe("-");
  });

  it('should return "Mid" when result is "M"', () => {
    expect(pipe.transform("M", matchDetail, 0)).toBe("Middle");
  });

  it('should return "Not Mid" when result is "NM"', () => {
    expect(pipe.transform("NM", matchDetail, 0)).toBe("Top or Bottom");
  });

  it('return "Bottom" when result is "B"', () => {
    expect(pipe.transform("B", matchDetail, 0)).toBe("Bottom");
  });

  it('return "Not Bottom" when result is "NB"', () => {
    expect(pipe.transform("NB", matchDetail, 0)).toBe("Top or Middle");
  });

  it('return "Overlord" when result is "O"', () => {
    expect(pipe.transform("O", matchDetail, 0)).toBe("Overlord");
  });

  it('return "Tyrant" when result is "T" and group is 11', () => {
    expect(pipe.transform("T", matchDetail, 11)).toBe("Tyrant");
  });

  it('return "Not Tyrant" when result is "NT" and group is 12', () => {
    expect(pipe.transform("NT", matchDetail, 12)).toBe("Overlord or Middle");
  });

  it('return "Top" when result is "T"', () => {
    expect(pipe.transform("T", matchDetail, 0)).toBe("Top");
  });

  it('return "Not Top" when result is "NT"', () => {
    expect(pipe.transform("NT", matchDetail, 0)).toBe("Middle or Bottom");
  });

  it('return current value when result is out of definition', () => {
    expect(pipe.transform("Z", matchDetail, 0)).toBe("Z");
  });
});
