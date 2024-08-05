import { VerifyService } from './index';
import { TestBed } from '@angular/core/testing';
import { ResultDetail } from '../../../models';
import { BetTypes } from '../../../constants';
import { ResultSettingModel } from '../../../../shared/models';
import { SettlementStatusId } from '../../../../shared/constants';

export class CreateDataTest {
    public static FakeData(
        betType: string,
        home: string,
        away: string,
        map: number,
        settlementStatusId: number,
        checked: boolean) {
        return {
            resourceId: null,
            resourceName:'',
            homeValue: home,
            awayValue: away,
            resultStatusId: null,
            settlementStatusId,
            resultStatus:'',
            map,
            ticketStatus: null,
            betType,
            betTypeName: null,
            checked,
            isResultWarning: true,
            isHomeValueWarning: null,
            isAwayValueWarning: null,
            isInvalidValue: true,
            isNotTaken: false,
            isSettleDetermined: false,
            isSettleDeterminedOriginal: false,
            isInvalidSelectedProceed: false,
            isNotExistedValue: false,
            resultSettingData: new ResultSettingModel(),
        };
    }
}

describe('Soccer - VerifyService', () => {
    let service: VerifyService;
    beforeEach(() => TestBed.configureTestingModule({
        providers: [
            VerifyService
        ],
    }));

    beforeEach(() => {
        service = TestBed.inject(VerifyService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('isOverTime', () => {
        it('Should return true when bettype = TimeOfFirstCorner, home = 90 and away > 0', () => {
            const resultDetails: ResultDetail[] = [];
            resultDetails.push(CreateDataTest.FakeData(BetTypes.TimeOfFirstCorner, "90", "1", 1, SettlementStatusId.Calculated, true));
            expect(service.isOverTime(resultDetails)).toBe(true);
        });

        it('Should return true when bettype = TimeOfSecondCorner, home = 90 and away > 0', () => {
            const resultDetails: ResultDetail[] = [];
            resultDetails.push(CreateDataTest.FakeData(BetTypes.TimeOfSecondCorner, "90", "1", 1, SettlementStatusId.Calculated, true));
            expect(service.isOverTime(resultDetails)).toBe(true);
        });

        it('Should return false when bettype != TimeOfSecondCorner and TimeOfFirstCorner', () => {
            const resultDetails: ResultDetail[] = [];
            resultDetails.push(CreateDataTest.FakeData(BetTypes.PenaltyShootoutCombo, "90", "1", 1, SettlementStatusId.Calculated, true));
            expect(service.isOverTime(resultDetails)).toBe(false);
        });
    });

    describe('isInvalidSecondTime', () => {
        it('Should return false when there are not bettype TimeOfSecondCorner and TimeOfFirstCorner', () => {
            const resultDetails: ResultDetail[] = [];
            resultDetails.push(CreateDataTest.FakeData(BetTypes.PenaltyShootoutCombo, "90", "1", 1, SettlementStatusId.Calculated, true));
            expect(service.isInvalidSecondTime(resultDetails)).toBe(false);
        });

        it('Should return false when there are bettype TimeOfSecondCorner, TimeOfFirstCorner and awayValue < 59', () => {
            const resultDetails: ResultDetail[] = [];
            resultDetails.push(CreateDataTest.FakeData(BetTypes.TimeOfSecondCorner, "90", "59", 1, SettlementStatusId.Calculated, true));
            expect(service.isInvalidSecondTime(resultDetails)).toBe(false);
        });

        it('Should return true when there are bettype TimeOfSecondCorner, TimeOfFirstCorner and awayValue > 59', () => {
            const resultDetails: ResultDetail[] = [];
            resultDetails.push(CreateDataTest.FakeData(BetTypes.TimeOfSecondCorner, "90", "60", 1, SettlementStatusId.Calculated, true));
            expect(service.isInvalidSecondTime(resultDetails)).toBe(true);
        });
    });

    describe('isInvalidMinuteTimeOf2HFirstCorner', () => {
        it('Should return false when there are not bettype TimeOfSecondCorner', () => {
            const resultDetails: ResultDetail[] = [];
            resultDetails.push(CreateDataTest.FakeData(BetTypes.PenaltyShootoutCombo, "90", "1", 1, SettlementStatusId.Calculated, true));
            expect(service.isInvalidMinuteTimeOf2HFirstCorner(resultDetails)).toBe(false);
        });

        it('Should return false when there are bettype TimeOfSecondCorner and homeValue < 90', () => {
            const resultDetails: ResultDetail[] = [];
            resultDetails.push(CreateDataTest.FakeData(BetTypes.TimeOfSecondCorner, "89", "", 1, SettlementStatusId.Calculated, true));
            expect(service.isInvalidMinuteTimeOf2HFirstCorner(resultDetails)).toBe(false);
        });

        it('Should return true when there are bettype TimeOfSecondCorner and homeValue > 90', () => {
            const resultDetails: ResultDetail[] = [];
            resultDetails.push(CreateDataTest.FakeData(BetTypes.TimeOfSecondCorner, "91", "", 1, SettlementStatusId.Calculated, true));
            expect(service.isInvalidMinuteTimeOf2HFirstCorner(resultDetails)).toBe(true);
        });

        it('Should return true when there are bettype TimeOfSecondCorner and homeValue < 45', () => {
            const resultDetails: ResultDetail[] = [];
            resultDetails.push(CreateDataTest.FakeData(BetTypes.TimeOfSecondCorner, "44", "", 1, SettlementStatusId.Calculated, true));
            expect(service.isInvalidMinuteTimeOf2HFirstCorner(resultDetails)).toBe(true);
        });
    });

    describe('isInvalidMinuteTimeOfFirstCorner', () => {
        it('Should return false when there are not bettype TimeOfFirstCorner', () => {
            const resultDetails: ResultDetail[] = [];
            resultDetails.push(CreateDataTest.FakeData(BetTypes.PenaltyShootoutCombo, "", "", 1, SettlementStatusId.Calculated, true));
            expect(service.isInvalidMinuteTimeOfFirstCorner(resultDetails)).toBe(false);
        });

        it('Should return false when there are bettype TimeOfFirstCorner and homeValue < 90', () => {
            const resultDetails: ResultDetail[] = [];
            resultDetails.push(CreateDataTest.FakeData(BetTypes.TimeOfFirstCorner, "89", "", 1, SettlementStatusId.Calculated, true));
            expect(service.isInvalidMinuteTimeOfFirstCorner(resultDetails)).toBe(false);
        });

        it('Should return true when there are bettype TimeOfFirstCorner and homeValue > 90', () => {
            const resultDetails: ResultDetail[] = [];
            resultDetails.push(CreateDataTest.FakeData(BetTypes.TimeOfFirstCorner, "91", "", 1, SettlementStatusId.Calculated, true));
            expect(service.isInvalidMinuteTimeOfFirstCorner(resultDetails)).toBe(true);
        });
    });

    describe('isValidOnRound', () => {
        it('Should return false when there are not bettype on RelatedOnRound group', () => {
            const resultDetails: ResultDetail[] = [];
            resultDetails.push(CreateDataTest.FakeData(BetTypes.PenaltyShootoutCombo, "", "", 1, SettlementStatusId.Calculated, true));
            expect(service.isValidOnRound(resultDetails)).toBe(false);
        });

        it('Should return false when there are bettype on RelatedOnRound group', () => {
            const resultDetails: ResultDetail[] = [];
            resultDetails.push(CreateDataTest.FakeData(BetTypes.PenaltyShootout1X2, "", "", 1, SettlementStatusId.Calculated, true));
            expect(service.isValidOnRound(resultDetails)).toBe(false);
        });

        it('Should return true when there are bettype on resultDetailOnRound and RelatedOnRound group', () => {
            const resultDetails: ResultDetail[] = [];
            resultDetails.push(CreateDataTest.FakeData(BetTypes.PenaltyShootout1X2, "", "", 1, SettlementStatusId.Calculated, true));
            resultDetails.push(CreateDataTest.FakeData(BetTypes.PenaltyWoodwork, "", "", 2, SettlementStatusId.Calculated, true));
            resultDetails.push(CreateDataTest.FakeData(BetTypes.HomePenaltyShootout, "", "", 2, SettlementStatusId.Running, false));
            expect(service.isValidOnRound(resultDetails)).toBe(true);
        });

    });

    describe('isValidOnFirstTen', () => {
        it('Should return false when there are not bettype on homeAwayFirstTenBetType group', () => {
            const resultDetails: ResultDetail[] = [];
            resultDetails.push(CreateDataTest.FakeData(BetTypes.PenaltyWoodwork, "", "", 1, SettlementStatusId.Calculated, true));
            expect(service.isValidOnFirstTen(resultDetails)).toBe(false);
        });

        it('Should return true when there are bettype on homeAwayFirstTenBetType group', () => {
            const resultDetails: ResultDetail[] = [];
            resultDetails.push(CreateDataTest.FakeData(BetTypes.PenaltyShootoutOddEven, "", "", 1, SettlementStatusId.Calculated, true));
            resultDetails.push(CreateDataTest.FakeData(BetTypes.PenaltyShootoutCombo, "", "", 2, SettlementStatusId.Calculated, true));
            resultDetails.push(CreateDataTest.FakeData(BetTypes.HomePenaltyShootout, "", "", 2, SettlementStatusId.Running, false));
            expect(service.isValidOnFirstTen(resultDetails)).toBe(true);
        });

        it('Should return false when there are not bettype on homeFirstTenBetType or awayFirstTenBetType group', () => {
            const resultDetails: ResultDetail[] = [];
            resultDetails.push(CreateDataTest.FakeData(BetTypes.PenaltyShootoutOddEven, "", "", 1, SettlementStatusId.Calculated, true));
            expect(service.isValidOnFirstTen(resultDetails)).toBe(false);
        });

        it('Should return true when there are bettype on homeFirstTenBetType group', () => {
            const resultDetails: ResultDetail[] = [];
            resultDetails.push(CreateDataTest.FakeData(BetTypes.PenaltyShootoutHomeScore, "", "", 1, SettlementStatusId.Calculated, true));
            resultDetails.push(CreateDataTest.FakeData(BetTypes.PenaltyShootoutCombo, "", "", 2, SettlementStatusId.Calculated, true));
            resultDetails.push(CreateDataTest.FakeData(BetTypes.HomePenaltyShootout, "", "", 2, SettlementStatusId.Running, false));
            expect(service.isValidOnFirstTen(resultDetails)).toBe(true);
        });

        it('Should return true when there are bettype on awayFirstTenBetType group', () => {
            const resultDetails: ResultDetail[] = [];
            resultDetails.push(CreateDataTest.FakeData(BetTypes.PenaltyShootoutAwayScore, "", "", 1, SettlementStatusId.Calculated, true));
            resultDetails.push(CreateDataTest.FakeData(BetTypes.PenaltyShootoutCombo, "", "", 2, SettlementStatusId.Calculated, true));
            resultDetails.push(CreateDataTest.FakeData(BetTypes.AwayPenaltyShootout, "", "", 2, SettlementStatusId.Running, false));
            expect(service.isValidOnFirstTen(resultDetails)).toBe(true);
        });
    });
});