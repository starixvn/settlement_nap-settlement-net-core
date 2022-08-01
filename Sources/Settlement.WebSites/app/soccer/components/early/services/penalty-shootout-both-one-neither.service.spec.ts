import { TestBed } from '@angular/core/testing';
import { PenaltyShootoutBothOneNeitherService, PenaltyShootoutService } from './index';
import { Score } from '../../../models';

describe(`Soccer - PenaltyShootoutBothOneNeitherService`, () => {
    let service: PenaltyShootoutBothOneNeitherService;
    let penaltyService: PenaltyShootoutService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                PenaltyShootoutService,
                PenaltyShootoutBothOneNeitherService,
            ],
        });

        service = TestBed.get(PenaltyShootoutBothOneNeitherService);
        penaltyService = TestBed.get(PenaltyShootoutService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('resetValuePenalyShootoutBothOneNeither', () => {
        it('Should return empty when homeValue or awayValue is empty.', () => {
            const score = new Score("", "");
            const expectedValue = "";
            expect(service.resetValuePenalyShootoutBothOneNeither(score)).toBe(expectedValue);
        });

        describe('Home is Score', () => {
            it('Should return O when homeValue = S and awayValue = M.', () => {
                const score = new Score("S", "M");
                const expectedValue = "O";
                expect(service.resetValuePenalyShootoutBothOneNeither(score)).toBe(expectedValue);
            });

            it('Should return 1SNT when homeValue = S and awayValue = NT.', () => {
                const score = new Score("S", "NT");
                const expectedValue = "1SNT";
                expect(service.resetValuePenalyShootoutBothOneNeither(score)).toBe(expectedValue);
            });

            it('Should return B when homeValue = S and awayValue = S.', () => {
                const score = new Score("S", "S");
                const expectedValue = "B";
                expect(service.resetValuePenalyShootoutBothOneNeither(score)).toBe(expectedValue);
            });
        });

        describe('Away is Score', () => {
            it('Should return O when awayValue = S and homeValue = M.', () => {
                const score = new Score("M", "S");
                const expectedValue = "O";
                expect(service.resetValuePenalyShootoutBothOneNeither(score)).toBe(expectedValue);
            });

            it('Should return NT2S when awayValue = S and homeValue = NT.', () => {
                const score = new Score("NT", "S");
                const expectedValue = "NT2S";
                expect(service.resetValuePenalyShootoutBothOneNeither(score)).toBe(expectedValue);
            });
        });

        describe('Home and Away is not Score', () => {
            it('Should return X when both awayValue and homeValue are M', () => {
                const score = new Score("M", "M");
                const expectedValue = "N";
                expect(service.resetValuePenalyShootoutBothOneNeither(score)).toBe(expectedValue);
            });

            it('Should return 1MNT when homeValue = M and awayValue = NT.', () => {
                const score = new Score("M", "NT");
                const expectedValue = "1MNT";
                expect(service.resetValuePenalyShootoutBothOneNeither(score)).toBe(expectedValue);
            });

            it('Should return NT2M when homeValue = NT and awayValue = M.', () => {
                const score = new Score("NT", "M");
                const expectedValue = "NT2M";
                expect(service.resetValuePenalyShootoutBothOneNeither(score)).toBe(expectedValue);
            });

            it('Should return empty when both homeValue and awayValue are NT.', () => {
                const score = new Score("NT", "NT");
                const expected = "";
                expect(service.resetValuePenalyShootoutBothOneNeither(score)).toBe(expected);
            });
        });
    });
});