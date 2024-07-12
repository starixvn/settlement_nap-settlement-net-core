import { ScoreBySettlementPipe } from './score-by-settlement.pipe';
import { SettlementStatusId } from '../constants';

describe('Score by Settlement Pipe', () => {
    const pipe = new ScoreBySettlementPipe();
    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should return "-" when SettlementStatusId = running and score is null or empty', () => {
        const result = pipe.transform("", SettlementStatusId.Running);
        expect(result).toEqual("-");
    });

    it('should return right score when SettlementStatusId = running and score', () => {
        const result = pipe.transform("1", SettlementStatusId.Running);
        expect(result).toEqual("1");
    });

    it('should return "R" when SettlementStatusId = Refund', () => {
        const result = pipe.transform("1", SettlementStatusId.Refund);
        expect(result).toEqual("R");
    });

    it('should return "R.HT" when SettlementStatusId = RefundHalfTime', () => {
        const result = pipe.transform("1", SettlementStatusId.RefundHalfTime);
        expect(result).toEqual("R.HT");
    });

    it('should return "R.FT" when SettlementStatusId = RefundFullTime', () => {
        const result = pipe.transform("1", SettlementStatusId.RefundFullTime);
        expect(result).toEqual("R.FT");
    });

    it('should right score when SettlementStatusId = Calculated', () => {
        const result = pipe.transform("10", SettlementStatusId.Calculated);
        expect(result).toEqual("10");
    });

    it('should return "-" when incorrect SettlementStatusId', () => {
        const result = pipe.transform("1", 999);
        expect(result).toEqual("-");
    });

    it('should right score when SettlementStatusId = RefundSettleDetermined', () => {
        const result = pipe.transform("7", SettlementStatusId.RefundSettleDetermined);
        expect(result).toEqual("7");
    });

    it('should return "R" right score when score is empty or null', () => {
        const result = pipe.transform("", SettlementStatusId.RefundSettleDetermined);
        expect(result).toEqual("R");

        const resultNull = pipe.transform(null, SettlementStatusId.RefundSettleDetermined);
        expect(resultNull).toEqual("R");
    });
});