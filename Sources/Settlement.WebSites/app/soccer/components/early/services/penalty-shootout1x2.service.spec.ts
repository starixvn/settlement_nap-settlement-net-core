import { TestBed } from '@angular/core/testing';
import { PenaltyShootout1x2Service, PenaltyShootoutService } from './index';
import { Score } from '../../../models';

describe(`Soccer - SoccerService`, () => {
    let service: PenaltyShootout1x2Service;
    let penaltyService: PenaltyShootoutService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                PenaltyShootoutService,
                PenaltyShootout1x2Service],
        });

        service = TestBed.inject(PenaltyShootout1x2Service);
        penaltyService = TestBed.inject(PenaltyShootoutService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('resetValuePenaltyShootout1X2ByRound', () => {
        it('Should return empty when homeValue or awayValue is empty.', () => {
            const score = new Score("", "");
            const expectedValue = "";
            expect(service.resetValuePenaltyShootout1X2(score)).toBe(expectedValue);
        });

        describe('Home is Score', () => {
            it('Should return 1 when homeValue = S and awayValue = M.', () => {
                const score = new Score("S", "M");
                const expectedValue = "1";
                expect(service.resetValuePenaltyShootout1X2(score)).toBe(expectedValue);
            });

            it('Should return 1SNT when homeValue = S and awayValue = NT.', () => {
                const score = new Score("S", "NT");
                const expectedValue = "1SNT";
                expect(service.resetValuePenaltyShootout1X2(score)).toBe(expectedValue);
            });

            it('Should return X when homeValue = S and awayValue = S.', () => {
                const score = new Score("S", "S");
                const expectedValue = "X";
                expect(service.resetValuePenaltyShootout1X2(score)).toBe(expectedValue);
            });
        });

        describe('Away is Score', () => {
            it('Should return 2 when awayValue = S and homeValue = M.', () => {
                const score = new Score("M", "S");
                const expectedValue = "2";
                expect(service.resetValuePenaltyShootout1X2(score)).toBe(expectedValue);
            });

            it('Should return NT2S when awayValue = S and homeValue = NT.', () => {
                const score = new Score("NT", "S");
                const expectedValue = "NT2S";
                expect(service.resetValuePenaltyShootout1X2(score)).toBe(expectedValue);
            });
        });

        describe('Home and Away is not Score', () => {
            it('Should return X when both awayValue and homeValue are M', () => {
                const score = new Score("M", "M");
                const expectedValue = "X";
                expect(service.resetValuePenaltyShootout1X2(score)).toBe(expectedValue);
            });

            it('Should return 1MNT when homeValue = M and awayValue = NT.', () => {
                const score = new Score("M", "NT");
                const expectedValue = "1MNT";
                expect(service.resetValuePenaltyShootout1X2(score)).toBe(expectedValue);
            });

            it('Should return NT2M when homeValue = NT and awayValue = M.', () => {
                const score = new Score("NT", "M");
                const expectedValue = "NT2M";
                expect(service.resetValuePenaltyShootout1X2(score)).toBe(expectedValue);
            });

            it('Should return empty when both homeValue and awayValue are NT.', () => {
                const score = new Score("NT", "NT");
                const expected = "";
                expect(service.resetValuePenaltyShootout1X2(score)).toBe(expected);
            });
        });
    });
});