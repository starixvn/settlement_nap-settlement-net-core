import { InputOption } from '../../shared/models/sportsbook-sop';
import { ResultByPlayerNamePipe } from './result-by-player-name.pipe';

describe('Pipe: ResultByPlayerName', () => {
  let pipe: ResultByPlayerNamePipe;

  beforeEach(() => {
    pipe = new ResultByPlayerNamePipe();
  });
  it('should return hyphen when value is empty', () => {
    expect(pipe.transform("", [])).toBe("-");
  });

  it('should return correct player name', () => {
    const optionOne: InputOption = {
      value:"1",
      optionName: "player1",
      playerId: 1
    };

    const optionTwo: InputOption = {
      value:"2",
      optionName: "player2",
      playerId: 2
    };

    expect(pipe.transform("1,2", [optionOne, optionTwo])).toBe("player1, player2");
  });
});
