import { VerifyRefundService, PenaltyShootoutService } from './index';
import { TestBed } from '@angular/core/testing';
import { ResultDetail } from '../../../models';
import { BetTypes } from '../../../constants';
import { ResultSettingModel } from '../../../../shared/models';

export class CreateDataTest {
    public static FakeData(
        betType: string,
        home: string,
        away: string,
        isSettleDetermined: boolean) {
        return {
            resourceId: null,
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
            isInvalidValue: true,
            isNotTaken: false,
            isSettleDetermined,
            isInvalidSelectedProceed: false,
            isNotExistedValue: false,
            resultSettingData: new ResultSettingModel(),
        };
    }
}

describe('Soccer - VerifyRefundService', () => {
    let service: VerifyRefundService;
    let penaltyShootoutService: PenaltyShootoutService;
    beforeEach(() => TestBed.configureTestingModule({
        providers: [
            VerifyRefundService,
            PenaltyShootoutService,
        ],
    }));

    beforeEach(() => {
        penaltyShootoutService = TestBed.inject(PenaltyShootoutService);
        service = TestBed.inject(VerifyRefundService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('Should return true when there are any home or away value = empty.', () => {
        const resultDetails: ResultDetail[] = [];
        resultDetails.push(CreateDataTest.FakeData(BetTypes.HomePenaltyShootout, "", "", false));

        spyOn(penaltyShootoutService, 'isEmptyHomeOrAwayValue').and.returnValue(true);
        expect(service.isEmptyResultValue(resultDetails)).toBe(true);
    });

    describe('isExistedNotTaken', () => {
        it('Should return true when penaltyWoodwork selected both home and away = Not Taken', () => {
            const resultDetails: ResultDetail[] = [];
            resultDetails.push(CreateDataTest.FakeData(BetTypes.PenaltyWoodwork, "NT", "NT", true));
            expect(service.isExistedNotTaken(resultDetails)).toBe(true);
        });

        it('Should return true when penaltyWoodwork selected both home and away !=Not Taken', () => {
            const resultDetails: ResultDetail[] = [];
            resultDetails.push(CreateDataTest.FakeData(BetTypes.PenaltyWoodwork, "H", "H", true));
            expect(service.isExistedNotTaken(resultDetails)).toBe(true);
        });

        it('Should return true when any bettypes is not selected = Not Taken', () => {
            const resultDetails: ResultDetail[] = [];
            resultDetails.push(CreateDataTest.FakeData(BetTypes.HomePenaltyShootout, "D", "", true));
            spyOn(penaltyShootoutService, 'isSelectedNotTaken').and.returnValue(false);
            expect(service.isExistedNotTaken(resultDetails)).toBe(true);
        });
    });

    it('Should return true when is existed isInvalidValue = true && isSettleDetermined = true', () => {
        const resultDetails: ResultDetail[] = [];
        resultDetails.push(CreateDataTest.FakeData(BetTypes.PenaltyShootoutBothOneNeither, "D", "", true));
        resultDetails.push(CreateDataTest.FakeData(BetTypes.PenaltyShootout1X2, "D", "", false));
        expect(service.isInconsistentValue(resultDetails)).toBe(true);
    });

});