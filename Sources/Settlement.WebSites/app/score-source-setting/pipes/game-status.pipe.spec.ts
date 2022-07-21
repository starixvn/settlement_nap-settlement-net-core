import { sportSupport } from '../constants';
import { GameStatusPipe } from './game-status.pipe';

describe('Pipe: GameStatusPipe', () => {
  let pipe: GameStatusPipe;
  beforeEach(() => {
    pipe = new GameStatusPipe();
  });

  it('return "Yes" when is active and sport Type is support game type', () => {
    expect(pipe.transform(true, sportSupport.gameTypes[0])).toBe("Yes");
  });

  it('return "No" when is not active and sport Type is support game type', () => {
    expect(pipe.transform(false, sportSupport.gameTypes[0])).toBe("No");
  });

  it('return "-" when sport is not support game type', () => {
    expect(pipe.transform(true, 0)).toBe("-");
  })
});
