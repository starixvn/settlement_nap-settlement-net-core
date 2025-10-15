import { TicketStatusPipe } from './ticket-status-pipe';
import { Team } from '../models';
import { TicketStatusText } from '../../shared/constants';

describe('TicketStatusPipe', () => {
  let pipe: TicketStatusPipe;

  beforeEach(() => {
    pipe = new TicketStatusPipe();
  });

  it('should return running if totalRunning > 0', () => {
    const team: Team = { totalRunning: 1, totalCal: 0 } as Team;
    expect(pipe.transform(team)).toBe(TicketStatusText.running);
  });

  it('should return calculated if totalCal > 0 and totalRunning is 0', () => {
    const team: Team = { totalRunning: 0, totalCal: 2 } as Team;
    expect(pipe.transform(team)).toBe(TicketStatusText.calculated);
  });

  it('should return noTicket if both totalRunning and totalCal are 0', () => {
    const team: Team = { totalRunning: 0, totalCal: 0 } as Team;
    expect(pipe.transform(team)).toBe(TicketStatusText.noTicket);
  });

  it('should handle missing properties gracefully', () => {
    const team: Team = {} as Team;
    expect(pipe.transform(team)).toBe(TicketStatusText.noTicket);
  });
});
