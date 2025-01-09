import {
    VerifyCalculateService,
    PenaltyShootoutService,
    VerifyRefundService,
    VerifyService
} from './index';
import { TestBed } from '@angular/core/testing';
import { ResultDetail } from '../../../models';
import { ResultSettingModel } from '../../../../shared/models';
import { Language } from '../../../../shared/language.native';
import { BetTypes, Resources } from '../../../constants';
export class CreateDataTest {
    public static FakeDataOne(
        betType: string,
        home: string,
        away: string,
        isInvalid: boolean) {
        return {
            resourceId: null,
            resourceName:'',
            homeValue: home,
            awayValue: away,
            resultStatusId: null,
            settlementStatusId: null,
            resultStatus: null,
            map: 1,
            ticketStatus: null,
            betType,
            betTypeName: null,
            checked: null,
            isResultWarning: true,
            isHomeValueWarning: null,
            isAwayValueWarning: null,
            isInvalidValue: isInvalid,
            isNotTaken: false,
            isSettleDetermined: false,
            isSettleDeterminedOriginal: false,
            isInvalidSelectedProceed: false,
            isNotExistedValue: false,
            resultSettingData: new ResultSettingModel(),
        } as ResultDetail;
    }

    public static FakeDataTwo(
        betType: string,
        checked: boolean) {
        return {
            resourceId: null,
            map: 1,
            ticketStatus: null,
            betType,
            betTypeName: null,
            homeValue: null,
            awayValue: null,
            resultStatusId: null,
            settlementStatusId: 0,
            resultStatus: null,
            checked,
            isResultWarning: true,
            isHomeValueWarning: null,
            isAwayValueWarning: null,
            isInvalidValue: false,
            isNotTaken: false,
            isSettleDetermined: false,
            isInvalidSelectedProceed: false,
            isNotExistedValue: false,
            resultSettingData: new ResultSettingModel(),
        };
    }
}

describe('Soccer - VerifyCalculateService', () => {
    let verifyCalculateService: VerifyCalculateService;
    let penaltyShootoutService: PenaltyShootoutService;
    let verifyService: VerifyService;
    let verifyRefundService: VerifyRefundService;
    beforeEach(() => TestBed.configureTestingModule({
        providers: [
            VerifyCalculateService,
            PenaltyShootoutService,
            VerifyRefundService,
            VerifyService
        ],
    }));

    beforeEach(() => {
        penaltyShootoutService = TestBed.inject(PenaltyShootoutService);
        verifyCalculateService = TestBed.inject(VerifyCalculateService);
        verifyRefundService = TestBed.inject(VerifyRefundService);
        verifyService = TestBed.inject(VerifyService);
    });

    it('should be created', () => {
        expect(verifyCalculateService).toBeTruthy();
    });

    describe('verifyInputValue', () => {
        it('Should return error message when there are any home or away value = empty.', () => {
            const resultDetails: ResultDetail[] = [];
            resultDetails.push(CreateDataTest.FakeDataOne("00", "", "", false));
            const actual = verifyCalculateService.verifyInputValue(resultDetails);
            expect(actual).toEqual(Language.NotSpecifyValidResults);
        });

        it('Should return empty when there are home and away value not empty.', () => {
            const resultDetails: ResultDetail[] = [];
            resultDetails.push(CreateDataTest.FakeDataOne("00", "S", "S", false));
            const actual = verifyCalculateService.verifyInputValue(resultDetails);
            expect(actual).toEqual("");
        });
    });

    describe('verifyPenaltyBettypeBeforeCalculation', () => {
        it('Should return NotTaken message when there are any home or away value = NotTaken.', () => {
            const resultDetails: ResultDetail[] = [];
            resultDetails.push(CreateDataTest.FakeDataOne(BetTypes.PenaltyShootout1X2, "", "", false));

            jest.spyOn(penaltyShootoutService, 'isSelectedNotTaken').mockReturnValue(true);
            const actual = verifyCalculateService.verifyPenaltyBettypeBeforeCalculation(resultDetails, []);
            expect(actual).toEqual(Resources.NotTaken);
        });

        it('Should return InvalidAssociatedHomeAway message when there are not settled', () => {
            jest.spyOn(verifyService, 'isValidOnRound').mockReturnValue(true);
            const actual = verifyCalculateService.verifyPenaltyBettypeBeforeCalculation([], []);
            expect(actual).toEqual(Resources.InvalidAssociatedHomeAway);
        });

        it('Should return InconsistentValue message when isInvalidValue = true', () => {
            const resultDetails: ResultDetail[] = [];
            resultDetails.push(CreateDataTest.FakeDataOne(BetTypes.PenaltyShootout1X2, "", "", true));

            const actual = verifyCalculateService.verifyPenaltyBettypeBeforeCalculation(resultDetails, []);
            expect(actual).toEqual(Resources.InconsistentValue);
        });

        it('Should return empty when pass all value before calculating.', () => {
            const resultDetails: ResultDetail[] = [];
            resultDetails.push(CreateDataTest.FakeDataOne(BetTypes.PenaltyShootout1X2, "", "", false));

            const actual = verifyCalculateService.verifyPenaltyBettypeBeforeCalculation(resultDetails, []);
            expect(actual).toEqual("");
        });
    });

    describe('verifyCornerBettypeBeforeCalculation', () => {
        it('Should return InvalidMinuteTimeOfFirstCorner message when isInvalidMinuteTimeOfFirstCorner = true.', () => {
            jest.spyOn(verifyService, 'isInvalidMinuteTimeOfFirstCorner').mockReturnValue(true);
            const actual = verifyCalculateService.verifyCornerBettypeBeforeCalculation([]);
            expect(actual).toEqual(Resources.InvalidMinuteTimeOfFirstCorner);
        });

        it('Should return InvalidMinuteTimeOf2HFirstCorner message when isInvalidMinuteTimeOf2HFirstCorner = true.', () => {
            jest.spyOn(verifyService, 'isInvalidMinuteTimeOf2HFirstCorner').mockReturnValue(true);
            const actual = verifyCalculateService.verifyCornerBettypeBeforeCalculation([]);
            expect(actual).toEqual(Resources.InvalidMinuteTimeOf2HFirstCorner);
        });

        it('Should return InvalidSecondTime message when isInvalidSecondTime = true.', () => {
            jest.spyOn(verifyService, 'isInvalidSecondTime').mockReturnValue(true);
            const actual = verifyCalculateService.verifyCornerBettypeBeforeCalculation([]);
            expect(actual).toEqual(Resources.InvalidSecondTime);
        });

        it('Should return NotSpecifyValidResults message when isOverTime = true.', () => {
            jest.spyOn(verifyService, 'isOverTime').mockReturnValue(true);
            const actual = verifyCalculateService.verifyCornerBettypeBeforeCalculation([]);
            expect(actual).toEqual(Language.NotSpecifyValidResults);
        });

        it('Should return empty when pass all value', () => {
            const actual = verifyCalculateService.verifyCornerBettypeBeforeCalculation([]);
            expect(actual).toEqual("");
        });
    });

    describe('verifyPenaltyBettypeBeforeRefund', () => {
        it('Should return NotSpecifyValidResults message when isEmptyResultValue = true.', () => {
            jest.spyOn(verifyRefundService, 'isEmptyResultValue').mockReturnValue(true);
            const actual = verifyCalculateService.verifyPenaltyBettypeBeforeRefund([],[],[]);
            expect(actual).toEqual(Language.NotSpecifyValidResults);
        });

        it('Should return NotTaken message when isExistedNotTaken = true.', () => {
            jest.spyOn(verifyRefundService, 'isExistedNotTaken').mockReturnValue(true);
            const actual = verifyCalculateService.verifyPenaltyBettypeBeforeRefund([],[],[]);
            expect(actual).toEqual(Resources.NotTaken);
        });

        it('Should return InvalidAssociatedHomeAway message when isValidOnRound = true.', () => {
            jest.spyOn(verifyService, 'isValidOnRound').mockReturnValue(true);
            const actual = verifyCalculateService.verifyPenaltyBettypeBeforeRefund([],[],[]);
            expect(actual).toEqual(Resources.InvalidAssociatedHomeAway);
        });

        it('Should return InconsistentValue message when isInconsistentValue = true.', () => {
            jest.spyOn(verifyRefundService, 'isInconsistentValue').mockReturnValue(true);
            const actual = verifyCalculateService.verifyPenaltyBettypeBeforeRefund([],[],[]);
            expect(actual).toEqual(Resources.InconsistentValue);
        });

        it('Should return empty when pass all value', () => {
            const actual = verifyCalculateService.verifyPenaltyBettypeBeforeRefund([],[],[]);
            expect(actual).toEqual("");
        });
    });

    describe('isChangedScore', () => {
        it('Should return false when score is not changed.', () => {
            const resultDetail = CreateDataTest.FakeDataOne("00", "1", "2", false);
            resultDetail.resultStatus = "Complete";
            const resultDetails: ResultDetail[] = [resultDetail];

            const actual = verifyCalculateService.isChangedScore(resultDetails, resultDetails);
            expect(actual).toBe(false);
        });

        it('Should return true when score is changed.', () => {
            const resultDetail = CreateDataTest.FakeDataOne("00", "1", "2", false);
            resultDetail.resultStatus = "Complete";
            const resultDetails: ResultDetail[] = [resultDetail];

            const newResultDetail = CreateDataTest.FakeDataOne("00", "2", "2", false);
            newResultDetail.resultStatus = "Complete";
            const newResultDetails: ResultDetail[] = [newResultDetail];

            const actual = verifyCalculateService.isChangedScore(resultDetails, newResultDetails);
            expect(actual).toBe(true);
        });
    });
});
