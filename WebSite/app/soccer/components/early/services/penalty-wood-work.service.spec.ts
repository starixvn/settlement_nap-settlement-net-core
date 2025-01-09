import { TestBed } from '@angular/core/testing';
import { PenaltyWoodWorkService, PenaltyShootoutService } from './index';
import { Score } from '../../../models';
import { ResultValue, BetTypes } from '../../../constants';
import { ResultDetail } from '../../../models';
import { ResultSettingModel } from '../../../../shared/models';

export class CreateDataTest {
    public static FakeData(
        betType: string,
        home: string,
        away: string) {
        return {
            resourceId: null,
            resourceName:'',
            map: 1,
            ticketStatus: null,
            betType,
            betTypeName: null,
            homeValue: home,
            awayValue: away,
            resultStatusId: null,
            settlementStatusId: null,
            resultStatus: null,
            checked: null,
            isResultWarning: true,
            isHomeValueWarning: null,
            isAwayValueWarning: null,
            isInvalidValue: false,
            isNotTaken: false,
            isSettleDetermined: false,
            isSettleDeterminedOriginal: false,
            isInvalidSelectedProceed: false,
            isNotExistedValue: false,
            resultSettingData: new ResultSettingModel(),
        } as ResultDetail;
    }
}

describe(`Soccer - SoccerService`, () => {
    let service: PenaltyWoodWorkService;
    let penaltyService: PenaltyShootoutService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                PenaltyShootoutService,
                PenaltyWoodWorkService],
        });

        service = TestBed.inject(PenaltyWoodWorkService);
        penaltyService = TestBed.inject(PenaltyShootoutService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('resetResultValue', () => {
        it('Should return Not Taken when selectedValue = NT', () => {
            const expectedValue = ResultValue.NotTaken;
            expect(service.resetResultValue("", "NT")).toEqual(expectedValue);
        });

        it('Should return empty when currentValue = NT', () => {
            expect(service.resetResultValue("NT", "")).toEqual("");
        });

        it('Should return current value when currentValue = H or N', () => {
            expect(service.resetResultValue("H", "")).toEqual("H");
            expect(service.resetResultValue("N", "")).toEqual("N");
        });
    });

    it('Should return true when woodwork and home/away penalty not match on round', () => {
        const resultDetails: ResultDetail[] = [];
        resultDetails.push(CreateDataTest.FakeData(BetTypes.PenaltyWoodwork, "NT", "NT"));
        const selectedItem = CreateDataTest.FakeData(BetTypes.PenaltyWoodwork, "H", "H");

        expect(service.isInvalidResult(resultDetails, selectedItem)).toBe(true);
    });

    describe('isInvalidHomeOrAwayResult', () => {
        it('Should return true when not match home value.', () => {
            const selectedItem = CreateDataTest.FakeData(BetTypes.PenaltyWoodwork, "H", "H");

            const selectedScoreByRound = new Score("", "S");
            expect(service.isInvalidHomeOrAwayResult(selectedItem, selectedScoreByRound)).toBe(true);
        });

        it('Should return true when not match away value.', () => {
            const selectedItem = CreateDataTest.FakeData(BetTypes.PenaltyWoodwork, "H", "H");

            const selectedScoreByRound = new Score("S", "");
            expect(service.isInvalidHomeOrAwayResult(selectedItem, selectedScoreByRound)).toBe(true);
        });

        it('Should return fasle when home and away are empty but home/away main penalty not empty.', () => {
            const selectedItem = CreateDataTest.FakeData(BetTypes.PenaltyWoodwork, "", "");

            const selectedScoreByRound = new Score("S", "S");
            expect(service.isInvalidHomeOrAwayResult(selectedItem, selectedScoreByRound)).toBe(false);
        });

        it('Should return true when home penalty = NT and home woodwork != NT.', () => {
            const selectedItem = CreateDataTest.FakeData(BetTypes.PenaltyWoodwork, "N", "H");

            const selectedScoreByRound = new Score("NT", "M");
            expect(service.isInvalidHomeOrAwayResult(selectedItem, selectedScoreByRound)).toBe(true);
        });

        it('Should return true when home penalty != NT and home woodwork = NT.', () => {
            const selectedItem = CreateDataTest.FakeData(BetTypes.PenaltyWoodwork, "NT", "H");

            const selectedScoreByRound = new Score("M", "M");
            expect(service.isInvalidHomeOrAwayResult(selectedItem, selectedScoreByRound)).toBe(true);
        });

        it('Should return true when away penalty = NT and away woodwork != NT.', () => {
            const selectedItem = CreateDataTest.FakeData(BetTypes.PenaltyWoodwork, "H", "N");

            const selectedScoreByRound = new Score("M", "NT");
            expect(service.isInvalidHomeOrAwayResult(selectedItem, selectedScoreByRound)).toBe(true);
        });

        it('Should return true when away penalty != NT and away woodwork = NT.', () => {
            const selectedItem = CreateDataTest.FakeData(BetTypes.PenaltyWoodwork, "H", "NT");

            const selectedScoreByRound = new Score("S", "S");
            expect(service.isInvalidHomeOrAwayResult(selectedItem, selectedScoreByRound)).toBe(true);
        });
    });
});