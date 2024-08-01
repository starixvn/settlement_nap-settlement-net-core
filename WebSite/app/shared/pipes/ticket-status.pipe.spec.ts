
import { ResultDetail } from '../models/sportsbook-sop';
import { TicketStatusPipe } from './ticket-status.pipe';

describe('Pipe: TicketStatusPipe', () => {
    let pipe: TicketStatusPipe;
    beforeEach(() => {
        pipe = new TicketStatusPipe();
    });

    it('should return new list after filter by ticket status', () => {
        const item1 = new ResultDetail();
        item1.ticketStatus = "Calculated";
        const item2 = new ResultDetail();
        item2.ticketStatus = "No Ticket";
        const args = 'Calculated';
        const items = [item1, item2];
        expect(pipe.transform(items, args)).toEqual([item1]);
    });

    it('should not return result running  when filter Parlay Running', () => {
        const item1 = new ResultDetail();
        item1.ticketStatus = "Running";
        const item2 = new ResultDetail();
        item2.ticketStatus = "No Ticket";
        const args = 'Parlay Running';
        const items = [item1, item2];
        expect(pipe.transform(items, args)).toEqual([]);
    });
});
