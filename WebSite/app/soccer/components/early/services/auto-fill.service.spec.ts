import { TestBed } from '@angular/core/testing';
import {
    AutoFillService,
    PenaltyShootoutService,
    PenaltyShootout1x2Service,
    PenaltyShootoutBothOneNeitherService,
    PenaltyWoodWorkService
} from './index';
import { BetTypes, ResultValue } from '../../../constants';
import { ResultDetail } from '../../../models';
import { ResultSettingModel } from '../../../../shared/models';
export class CreateDataTest {
    public static FakeData(
        betType: string,
        map: number,
        homeValue: string,
        awayValue: string,
        settlementStatusId: number,
        isSettleDetermined: boolean,
        isInvalidValue: boolean,
        isNotTaken: boolean) {
        return {
            resourceId: null,
            map,
            ticketStatus: null,
            betType,
            betTypeName: null,
            homeValue,
            awayValue,
            resultStatusId: null,
            settlementStatusId,
            resultStatus: null,
            checked: null,
            isResultWarning: false,
            isHomeValueWarning: null,
            isAwayValueWarning: null,
            isInvalidValue,
            isNotTaken,
            isSettleDetermined,
            isInvalidSelectedProceed: false,
            isNotExistedValue: true,
            resultSettingData: new ResultSettingModel(),
        };
    }
}

describe(`Soccer - AutoFillService`, () => {
    let service: AutoFillService;
    let penaltyShootout1x2Service: PenaltyShootout1x2Service;
    let bothOneNeitherService: PenaltyShootoutBothOneNeitherService;
    let penaltyWoodWorkService: PenaltyWoodWorkService;
    let penaltyService: PenaltyShootoutService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                AutoFillService,
                PenaltyShootoutService,
                PenaltyShootout1x2Service,
                PenaltyShootoutBothOneNeitherService,
                PenaltyWoodWorkService,
            ],
        });

        penaltyService = TestBed.inject(PenaltyShootoutService);
        penaltyShootout1x2Service = TestBed.inject(PenaltyShootout1x2Service);
        penaltyWoodWorkService = TestBed.inject(PenaltyWoodWorkService);
        bothOneNeitherService = TestBed.inject(PenaltyShootoutBothOneNeitherService);
        service = TestBed.inject(AutoFillService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('autoFillResult', () => {
        it('Should call isSelectedNotTaken method on penaltyService and right expected resultDetail '
            + ' when bettype != HomePenaltyShootout or AwayPenaltyShootout', () => {
            const selectedItem = CreateDataTest.FakeData(BetTypes.PenaltyShootout1X2, 1, "", "",
                                0, false, false, false);
            const resultDetails: ResultDetail[] = [];
            resultDetails.push(selectedItem);
            spyOn(penaltyService, 'isSelectedNotTaken').and.returnValue(true);
            service.autoFillResult(resultDetails, selectedItem);

            const expectedResult: ResultDetail[] = [];
            expectedResult.push(CreateDataTest.FakeData(
                BetTypes.PenaltyShootout1X2, 1, "", "", 0, true, false, true));

            expect(penaltyService.isSelectedNotTaken).toHaveBeenCalled();
            expect(resultDetails).toEqual(expectedResult);
        });

        const message = 'Should return expected result for';

        describe('resetValueOnRound', () => {
            it(message + ' PenaltyShootout1X2 bettype when selected on HomePenaltyShootout ', () => {
                const betType1x2 = CreateDataTest.FakeData(BetTypes.PenaltyShootout1X2, 1, "", "",
                0, false, false, false);
                const selectedItem = CreateDataTest.FakeData(BetTypes.HomePenaltyShootout, 1, ResultValue.Score, "",
                0, false, false, false);
                const resultDetails: ResultDetail[] = [];
                resultDetails.push(betType1x2);
                spyOn(penaltyShootout1x2Service, 'resetValuePenaltyShootout1X2').and.returnValue(ResultValue.Home);
                service.autoFillResult(resultDetails, selectedItem);

                const expectedResult: ResultDetail[] = [];
                expectedResult.push(CreateDataTest.FakeData(
                    BetTypes.PenaltyShootout1X2, 1, ResultValue.Home, "", 0, false, false, false));

                expect(resultDetails).toEqual(expectedResult);
            });

            it(message + ' PenaltyBothOneNeither bettype when selected on HomePenaltyShootout ', () => {
                const betTypeBothOneNeither = CreateDataTest.FakeData(BetTypes.PenaltyShootoutBothOneNeither, 1, "", "",
                0, false, false, false);
                const selectedItem = CreateDataTest.FakeData(BetTypes.HomePenaltyShootout, 1, ResultValue.Score, "",
                0, false, false, false);
                const resultDetails: ResultDetail[] = [];
                resultDetails.push(betTypeBothOneNeither);
                spyOn(bothOneNeitherService, 'resetValuePenalyShootoutBothOneNeither').and.returnValue(ResultValue.One);
                service.autoFillResult(resultDetails, selectedItem);

                const expectedResult: ResultDetail[] = [];
                expectedResult.push(CreateDataTest.FakeData(
                    BetTypes.PenaltyShootoutBothOneNeither, 1, ResultValue.One, "", 0, false, false, false));

                expect(resultDetails).toEqual(expectedResult);
            });

            it(message + ' PenaltyWoodwork bettype when selected on HomePenaltyShootout ', () => {
                const betTypePenaltyWoodwork = CreateDataTest.FakeData(BetTypes.PenaltyWoodwork, 1, "", "",
                0, false, false, false);
                const selectedItem = CreateDataTest.FakeData(BetTypes.HomePenaltyShootout, 1, ResultValue.NotTaken, "",
                0, false, false, false);
                const resultDetails: ResultDetail[] = [];
                resultDetails.push(betTypePenaltyWoodwork);
                spyOn(penaltyWoodWorkService, 'resetResultValue').and.returnValue(ResultValue.NotTaken);
                service.autoFillResult(resultDetails, selectedItem);

                const expectedResult: ResultDetail[] = [];
                expectedResult.push(CreateDataTest.FakeData(
                    BetTypes.PenaltyWoodwork, 1, ResultValue.NotTaken, "", 0, false, true, true));

                expect(resultDetails).toEqual(expectedResult);
            });

            it(message + ' PenaltyWoodwork bettype when selected on AwayPenaltyShootout ', () => {
                const betTypePenaltyWoodwork = CreateDataTest.FakeData(BetTypes.PenaltyWoodwork, 1, "", "",
                0, false, false, false);
                const selectedItem = CreateDataTest.FakeData(BetTypes.AwayPenaltyShootout, 1, "", ResultValue.NotTaken,
                0, false, false, false);
                const resultDetails: ResultDetail[] = [];
                resultDetails.push(betTypePenaltyWoodwork);
                spyOn(penaltyWoodWorkService, 'resetResultValue').and.returnValue(ResultValue.NotTaken);
                service.autoFillResult(resultDetails, selectedItem);

                const expectedResult: ResultDetail[] = [];
                expectedResult.push(CreateDataTest.FakeData(
                    BetTypes.PenaltyWoodwork, 1, "", ResultValue.NotTaken, 0, false, true, true));

                expect(resultDetails).toEqual(expectedResult);
            });
        });

        describe('resetValueOnFirstTen', () => {
            it(message + ' Penalty Shootout Home Score - First 10 bettype when selected on HomePenaltyShootout ', () => {
                const betTypeHomeOverUnder = CreateDataTest.FakeData(BetTypes.PenaltyShootoutHomeScore, 6, "", "",
                0, false, false, false);
                const selectedItem = CreateDataTest.FakeData(BetTypes.HomePenaltyShootout, 1, ResultValue.Score, "",
                0, false, false, false);

                const resultDetails: ResultDetail[] = [];
                resultDetails.push(betTypeHomeOverUnder);
                spyOn(penaltyService, 'countHomePenaltyShooutoutByScore').and.returnValue("2");
                service.autoFillResult(resultDetails, selectedItem);

                const expectedResult: ResultDetail[] = [];
                expectedResult.push(CreateDataTest.FakeData(
                    BetTypes.PenaltyShootoutHomeScore, 6, "2", "", 0, false, false, false));

                expect(resultDetails).toEqual(expectedResult);
            });

            it(message + ' Penalty Shootout Away Score - First 10 bettype when selected on HomePenaltyShootout ', () => {
                const betTypeAwayOverUnder = CreateDataTest.FakeData(BetTypes.PenaltyShootoutAwayScore, 6, "", "",
                0, false, false, false);
                const selectedItem = CreateDataTest.FakeData(BetTypes.AwayPenaltyShootout, 1, ResultValue.Score, "",
                0, false, false, false);

                const resultDetails: ResultDetail[] = [];
                resultDetails.push(betTypeAwayOverUnder);
                spyOn(penaltyService, 'countAwayPenaltyShooutoutByScore').and.returnValue("3");
                service.autoFillResult(resultDetails, selectedItem);

                const expectedResult: ResultDetail[] = [];
                expectedResult.push(CreateDataTest.FakeData(
                    BetTypes.PenaltyShootoutAwayScore, 6, "3", "", 0, false, false, false));

                expect(resultDetails).toEqual(expectedResult);
            });

            it(message + ' PenaltyShootoutOddEven bettype when selected on HomePenaltyShootout ', () => {
                const betTypeOddEven = CreateDataTest.FakeData(BetTypes.PenaltyShootoutOddEven, 6, "", "",
                0, false, false, false);
                const selectedItem = CreateDataTest.FakeData(BetTypes.AwayPenaltyShootout, 1, ResultValue.Score, "",
                0, false, false, false);

                const resultDetails: ResultDetail[] = [];
                resultDetails.push(betTypeOddEven);
                spyOn(penaltyService, 'countHomePenaltyShooutoutByScore').and.returnValue("2");
                spyOn(penaltyService, 'countAwayPenaltyShooutoutByScore').and.returnValue("3");
                service.autoFillResult(resultDetails, selectedItem);

                const expectedResult: ResultDetail[] = [];
                expectedResult.push(CreateDataTest.FakeData(
                    BetTypes.PenaltyShootoutOddEven, 6, "2", "3", 0, false, false, false));

                expect(resultDetails).toEqual(expectedResult);
            });

            it(message + ' PenaltyShootoutExactTotalGoals bettype when selected on HomePenaltyShootout ', () => {
                const betTypeTotalGoal = CreateDataTest.FakeData(BetTypes.PenaltyShootoutExactTotalGoals, 6, "", "",
                0, false, false, false);
                const selectedItem = CreateDataTest.FakeData(BetTypes.AwayPenaltyShootout, 1, ResultValue.Score, "",
                0, false, false, false);

                const resultDetails: ResultDetail[] = [];
                resultDetails.push(betTypeTotalGoal);
                service.autoFillResult(resultDetails, selectedItem);

                const expectedResult: ResultDetail[] = [];
                expectedResult.push(CreateDataTest.FakeData(
                    BetTypes.PenaltyShootoutExactTotalGoals, 6, "", "", 0, false, false, false));

                expect(resultDetails).toEqual(expectedResult);
            });
        });
    });

    describe('changeValueOnPenaltyFirstTen', () => {
        it('should change penalty shoot out home score bet type', () => {
            const resultDetail = new ResultDetail();
            const resultDetails = [resultDetail];
            const selectedItem = new ResultDetail();
            selectedItem.betType = BetTypes.PenaltyShootoutHomeScore;

            service.changeValueOnPenaltyFirstTen(resultDetails, selectedItem);

            expect(selectedItem.isInvalidValue).toBe(true);
        });

        it('should change penalty shoot out away score bet type', () => {
            const resultDetail = new ResultDetail();
            const resultDetails = [resultDetail];
            const selectedItem = new ResultDetail();
            selectedItem.betType = BetTypes.PenaltyShootoutAwayScore;

            service.changeValueOnPenaltyFirstTen(resultDetails, selectedItem);

            expect(selectedItem.isInvalidValue).toBe(true);
        });

        it('should change penalty shoot out combo bet type', () => {
            const resultDetail = new ResultDetail();
            const resultDetails = [resultDetail];
            const selectedItem = new ResultDetail();
            selectedItem.betType = BetTypes.PenaltyShootoutCombo;

            service.changeValueOnPenaltyFirstTen(resultDetails, selectedItem);

            expect(selectedItem.isInvalidValue).toBe(true);
        });

        it('should change penalty shoot out exact total goal bet type', () => {
            const resultDetail = new ResultDetail();
            const resultDetails = [resultDetail];
            const selectedItem = new ResultDetail();
            selectedItem.betType = BetTypes.PenaltyShootoutExactTotalGoals;

            service.changeValueOnPenaltyFirstTen(resultDetails, selectedItem);

            expect(selectedItem.isInvalidValue).toBe(true);
        });

        it('should change penalty shoot out odd even bet type', () => {
            const resultDetail = new ResultDetail();
            const resultDetails = [resultDetail];
            const selectedItem = new ResultDetail();
            selectedItem.betType = BetTypes.PenaltyShootoutOddEven;

            service.changeValueOnPenaltyFirstTen(resultDetails, selectedItem);

            expect(selectedItem.isInvalidValue).toBe(true);
        });
    });
});