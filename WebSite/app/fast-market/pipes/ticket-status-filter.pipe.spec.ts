import { FastMarketResult } from '../models';
import { TicketStatusPipe } from './ticket-status-filter.pipe';

describe('Pipe: TicketStatusPipe', () => {
    let pipe: TicketStatusPipe;
    beforeEach(() => {
        pipe = new TicketStatusPipe();
    });

    it('should return new list after filter by ticket status', () => {
        const item1 = new FastMarketResult();
        item1.ticketStatus = 1;
        const item2 = new FastMarketResult();
        item2.ticketStatus = 2;
        const args = ['1'];
        const items = [item1, item2];
        expect(pipe.transform(items, args)).toEqual([item1]);
    });
});
