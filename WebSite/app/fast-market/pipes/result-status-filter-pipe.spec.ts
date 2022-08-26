import { FastMarketResult } from '../models';
import { ResultStatusPipe } from './result-status-filter.pipe';

describe('Pipe: ResultStatusPipe', () => {
    let pipe: ResultStatusPipe;
    beforeEach(() => {
        pipe = new ResultStatusPipe();
    });

    it('should return new list after filter by result status', () => {
        const item1 = new FastMarketResult();
        item1.resultStatus = 1;
        const item2 = new FastMarketResult();
        item2.resultStatus = 2;
        const args = ['1'];
        const items = [item1, item2];
        expect(pipe.transform(items, args)).toEqual([item1]);
    });
});
