import { FastMarketResult } from '../models';
import { IntervalPipe } from './interval-filter.pipe';

describe('Pipe: IntervalPipe', () => {
    let pipe: IntervalPipe;
    beforeEach(() => {
        pipe = new IntervalPipe();
    });

    it('should return new list after filter by interval', () => {
        const item1 = new FastMarketResult();
        item1.position = 1;
        const item2 = new FastMarketResult();
        item2.position = 2;
        const args = [1];
        const items = [item1, item2];
        expect(pipe.transform(items, args)).toEqual([item1]);
    });
});
