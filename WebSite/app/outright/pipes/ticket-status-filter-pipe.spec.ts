import { TicketStatusFilterPipe } from './ticket-status-filter-pipe';
import { Team } from '../models';
import { TicketStatusText } from '../../shared/constants';

describe('TicketStatusFilterPipe', () => {
  let pipe: TicketStatusFilterPipe;

  beforeEach(() => {
    pipe = new TicketStatusFilterPipe();
  });

  const teams: Team[] = [
    { totalRunning: 1, totalCal: 0, totalHide: 0, betCount: 1 } as Team,
    { totalRunning: 0, totalCal: 1, totalHide: 0, betCount: 1 } as Team,
    { totalRunning: 0, totalCal: 0, totalHide: 2, betCount: 0 } as Team,
    { totalRunning: 0, totalCal: 0, totalHide: 0, betCount: 0 } as Team,
    { totalRunning: 0, totalCal: 0, totalHide: 1, betCount: 1 } as Team,
  ];

  it('should return all teams if ticketStatusSelected is empty', () => {
    expect(pipe.transform(teams, '')).toEqual(teams);
  });

  it('should filter teams with running status', () => {
    const result = pipe.transform(teams, TicketStatusText.running);
    expect(result).toEqual([teams[0]]);
  });

  it('should filter teams with calculated status', () => {
    const result = pipe.transform(teams, TicketStatusText.calculated);
    expect(result).toEqual([teams[1]]);
  });

  it('should filter teams with noTicketHide status', () => {
    const result = pipe.transform(teams, TicketStatusText.noTicketHide);
    expect(result).toEqual([teams[2]]);
  });

  it('should filter teams with noTicket status', () => {
    const result = pipe.transform(teams, TicketStatusText.noTicket);
    expect(result).toEqual([teams[3]]);
  });

  it('should filter teams with multiple statuses', () => {
    const result = pipe.transform(teams, `${TicketStatusText.running},${TicketStatusText.noTicket}`);
    expect(result).toEqual([teams[0], teams[3]]);
  });

  it('should return empty array if no teams match', () => {
    const result = pipe.transform(teams, 'unknownStatus');
    expect(result).toEqual([]);
  });

  it('should handle empty teams array', () => {
    expect(pipe.transform([], TicketStatusText.running)).toEqual([]);
  });
});
