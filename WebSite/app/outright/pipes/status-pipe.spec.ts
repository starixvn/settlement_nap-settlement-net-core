import { StatusPipe } from './status-pipe';
import { Status, CompletedStatus, RunningStatus } from '../constants';
import { Team } from '../models';

describe('StatusPipe', () => {
  let pipe: StatusPipe;

  const teams: Team[] = [
    { originalStatus: 'completed', originalScreenshot: 'completed', status: 'completed' } as Team,
    { originalStatus: 'running', originalScreenshot: 'running', status: 'running' } as Team,
    { originalStatus: 'pending', originalScreenshot: 'pending', status: 'pending' } as Team,
  ];

  beforeEach(() => {
    pipe = new StatusPipe();
  });

  it('should return all teams if status is FilterStatuses[0]', () => {
    const result = pipe.transform(teams, 'all', 'all');
    expect(result).toEqual(teams);
  });

  it('should filter teams by running status', () => {
    const result = pipe.transform(teams, Status.running, 'all');
    const expected = teams.filter(t => RunningStatus.includes(t.originalStatus.toLowerCase()));
    expect(result).toEqual(expected);
  });

  it('should filter teams by completed status', () => {
    const result = pipe.transform(teams, Status.completed, 'all');
    const expected = teams.filter(t => CompletedStatus.includes(t.originalStatus.toLowerCase()));
    expect(result).toEqual(expected);
  });

  it('should filter teams by screenshot status', () => {
    const result = pipe.transform(teams, 'all', Status.running);
    const expected = teams.filter(t => RunningStatus.includes(t.originalScreenshot.toLowerCase()));
    expect(result).toEqual(expected);
  });

  it('should handle empty teams array', () => {
    const result = pipe.transform([], 'all', 'all');
    expect(result).toEqual([]);
  });

  it('should handle teams with missing status properties gracefully', () => {
    const teamsWithMissing = [
      { } as Team,
      { originalStatus: 'completed' } as Team,
      { originalScreenshot: 'running' } as Team,
    ];
    const result = pipe.transform(teamsWithMissing, Status.running, Status.running);
    expect(Array.isArray(result)).toBe(true);
  });
});