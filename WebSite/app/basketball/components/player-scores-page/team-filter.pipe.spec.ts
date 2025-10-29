import { TeamFilterPipe } from './team-filter.pipe';
import { Player } from './models';

describe('TeamFilterPipe', () => {
  let pipe: TeamFilterPipe;
  let mockPlayers: Player[];

  beforeEach(() => {
    pipe = new TeamFilterPipe();
    mockPlayers = [
      { playerId: 1, playerName: 'Player 1', teamId: 100, checked: false, scores: [] },
      { playerId: 2, playerName: 'Player 2', teamId: 100, checked: false, scores: [] },
      { playerId: 3, playerName: 'Player 3', teamId: 200, checked: false, scores: [] }
    ];
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return all players when teamId is null', () => {
    const result = pipe.transform(mockPlayers, null);
    expect(result).toEqual(mockPlayers);
  });

  it('should filter players by teamId', () => {
    const result = pipe.transform(mockPlayers, 100);
    expect(result.length).toBe(2);
    expect(result[0].teamId).toBe(100);
  });

  it('should return empty array when no players match teamId', () => {
    const result = pipe.transform(mockPlayers, 999);
    expect(result).toEqual([]);
  });

  it('should handle empty players array', () => {
    const result = pipe.transform([], 100);
    expect(result).toEqual([]);
  });
});