import { IntervalBackgroundPipe } from './interval-background.pipe';
import { SettlementStatusId } from '../constants';

describe('IntervalBackgroundPipe', () => {
    const pipe = new IntervalBackgroundPipe();
    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should return "calculated" when settlementStatusId equal 4', () => {
        const settlementStatusId = SettlementStatusId.Calculated;
        const result = pipe.transform(settlementStatusId);
        expect(result).toBe('calculated');
    });

    it('should return "refunded" when  settlementStatusId equal 1', () => {
        const settlementStatusId = SettlementStatusId.Refund;
        const result = pipe.transform(settlementStatusId);
        expect(result).toBe('refunded');
    });

    it('should return empty string when input another statusId', () => {
        const settlementStatusId = SettlementStatusId.Running;
        const result = pipe.transform(settlementStatusId);
        expect(result).toBe('');
    });
});