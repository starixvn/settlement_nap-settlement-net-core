import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import {
    GroupBetTypeService,
    AutoFillService,
    PenaltyShootoutService,
    PenaltyShootout1x2Service,
    PenaltyShootoutBothOneNeitherService,
    PenaltyWoodWorkService,
} from './index';
import { BetTypes, ResultValue } from '../../../constants';
import { ResultDetail, GroupMap, Score } from '../../../models';
import { ResultSettingModel } from '../../../../shared/models';
export class CreateDataTest {
    public static FakeData(
        betType: string,
        map: number,
        home: string,
        away: string,
        settlementStatusId: number,
        isSettleDetermined: boolean,
        isInvalidValue: boolean,
        isNotTaken: boolean) {
        return {
            resourceId: null,
            resourceName:'',
            homeValue: home,
            awayValue: away,
            resultStatusId: null,
            settlementStatusId,
            resultStatus: null,
            map,
            ticketStatus: null,
            betType,
            betTypeName: null,
            checked: null,
            isResultWarning: false,
            isHomeValueWarning: null,
            isAwayValueWarning: null,
            isInvalidValue,
            isNotTaken,
            isSettleDetermined,
            isSettleDeterminedOriginal: false,
            isInvalidSelectedProceed: false,
            isNotExistedValue: false,
            resultSettingData: new ResultSettingModel(),
        };
    }
}

describe(`Soccer - GroupBetTypeService`, () => {
    let service: GroupBetTypeService;
    let autoFillService: AutoFillService;
    let penaltyShootout1x2Service: PenaltyShootout1x2Service;
    let penaltyShootoutBothOneNeitherService: PenaltyShootoutBothOneNeitherService;
    let penaltyWoodWorkService: PenaltyWoodWorkService;
    let penaltyService: PenaltyShootoutService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                GroupBetTypeService,
                AutoFillService,
                PenaltyShootoutService,
                PenaltyShootout1x2Service,
                PenaltyShootoutBothOneNeitherService,
                PenaltyWoodWorkService,
            ],
        });

        autoFillService = TestBed.get(AutoFillService);
        penaltyService = TestBed.get(PenaltyShootoutService);
        penaltyShootout1x2Service = TestBed.get(PenaltyShootout1x2Service);
        penaltyWoodWorkService = TestBed.get(PenaltyWoodWorkService);
        penaltyShootoutBothOneNeitherService = TestBed.get(PenaltyShootoutBothOneNeitherService);
        service = TestBed.get(GroupBetTypeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('Should return 2 maps on resultDetail list when group by map', () => {
        const resultDetails: ResultDetail[] = [];
        resultDetails.push(CreateDataTest.FakeData(
            BetTypes.PenaltyShootoutSuddenDead, 8, "", "", 0, false, false, false));
        resultDetails.push(CreateDataTest.FakeData(BetTypes.FirstGoalMethod, 9, "", "", 0, false, false, false));
        resultDetails.push(CreateDataTest.FakeData(BetTypes.TimeOfFirstGoal, 9, "", "", 0, false, false, false));
        const maps = service.getGroupBetType(resultDetails);
        const numberMapExpected = 2;
        expect(maps.length).toBe(numberMapExpected);
    });

    describe('getGroupBetType', () => {
        const home = CreateDataTest.FakeData(BetTypes.HomePenaltyShootout, 1, "", "", 0, false, false, false);
        const away = CreateDataTest.FakeData(BetTypes.AwayPenaltyShootout, 1, "", "", 0, false, false, false);
        describe('autoSelectedResultOn1x2AndBothOneNeither', () => {
            it('Should return expected resultDetail when settlementStatusId != Running ', () => {
                const resultDetails: ResultDetail[] = [];
                resultDetails.push(home);
                resultDetails.push(away);
                resultDetails.push(CreateDataTest.FakeData(
                    BetTypes.PenaltyShootout1X2, 1, "", "", 1, false, false, false));
                jest.spyOn(autoFillService, 'checkConsistentOnBetTypes').mockReturnValue(true);
                const maps = service.getGroupBetType(resultDetails);

                const expectedResult: ResultDetail[] = [];
                expectedResult.push(home);
                expectedResult.push(away);
                expectedResult.push(CreateDataTest.FakeData(
                    BetTypes.PenaltyShootout1X2, 1, "", "", 1, false, false, false));
                const expectedMaps: GroupMap[] = [];
                const map = new GroupMap(1, expectedResult);
                expectedMaps.push(map);

                expect(maps).toEqual(expectedMaps);
            });

            it('Should return expected resultDetail when betType = PenaltyShootout1X2'
                + ' and settlementStatusId = Running ', () => {
                    const resultDetails: ResultDetail[] = [];
                    resultDetails.push(home);
                    resultDetails.push(away);
                    resultDetails.push(CreateDataTest.FakeData(
                        BetTypes.PenaltyShootout1X2, 1, "", "", 0, false, false, false));
                    jest.spyOn(penaltyShootout1x2Service, 'resetValuePenaltyShootout1X2').mockReturnValue(ResultValue.Draw);
                    const maps = service.getGroupBetType(resultDetails);

                    const expectedResult: ResultDetail[] = [];
                    expectedResult.push(home);
                    expectedResult.push(away);
                    expectedResult.push(CreateDataTest.FakeData(
                        BetTypes.PenaltyShootout1X2, 1, ResultValue.Draw, "", 0, false, false, false));
                    const expectedMaps: GroupMap[] = [];
                    const map = new GroupMap(1, expectedResult);
                    expectedMaps.push(map);

                    expect(maps).toEqual(expectedMaps);
                });

            it('Should return expected resultDetail when betType = PenaltyShootoutBothOneNeither'
                + ' and settlementStatusId = Running ', () => {
                    const resultDetails: ResultDetail[] = [];
                    resultDetails.push(home);
                    resultDetails.push(away);
                    resultDetails.push(CreateDataTest.FakeData(
                        BetTypes.PenaltyShootoutBothOneNeither, 1, "", "", 0, false, false, false));
                    jest.spyOn(penaltyShootoutBothOneNeitherService,
                        'resetValuePenalyShootoutBothOneNeither').mockReturnValue(ResultValue.Both);
                    const maps = service.getGroupBetType(resultDetails);

                    const expectedResult: ResultDetail[] = [];
                    expectedResult.push(home);
                    expectedResult.push(away);
                    expectedResult.push(CreateDataTest.FakeData(
                        BetTypes.PenaltyShootoutBothOneNeither, 1, ResultValue.Both, "", 0, false, false, false));
                    const expectedMaps: GroupMap[] = [];
                    const map = new GroupMap(1, expectedResult);
                    expectedMaps.push(map);

                    expect(maps).toEqual(expectedMaps);
                });
        });

        describe('autoSelectedResultPenaltyWoodWork', () => {
            it('Should return expected resultDetail when settlementStatusId != Running ', () => {
                const resultDetails: ResultDetail[] = [];
                resultDetails.push(home);
                resultDetails.push(away);
                resultDetails.push(CreateDataTest.FakeData(
                    BetTypes.PenaltyWoodwork, 1, "", "", 1, false, false, false));
                jest.spyOn(penaltyWoodWorkService, 'isInvalidHomeOrAwayResult').mockReturnValue(true);
                const maps = service.getGroupBetType(resultDetails);

                const expectedResult: ResultDetail[] = [];
                expectedResult.push(home);
                expectedResult.push(away);
                expectedResult.push(CreateDataTest.FakeData(
                    BetTypes.PenaltyWoodwork, 1, "", "", 1, false, true, false));
                const expectedMaps: GroupMap[] = [];
                const map = new GroupMap(1, expectedResult);
                expectedMaps.push(map);

                expect(maps).toEqual(expectedMaps);
            });

            it('Should return expected resultDetail when '
                + ' betType = PenaltyWoodwork and settlementStatusId = Running ', () => {
                    const resultDetails: ResultDetail[] = [];
                    resultDetails.push(home);
                    resultDetails.push(away);
                    resultDetails.push(CreateDataTest.FakeData(
                        BetTypes.PenaltyWoodwork, 1, "", "", 0, false, false, false));
                    jest.spyOn(penaltyWoodWorkService, 'resetResultValue').mockReturnValue(ResultValue.NotTaken);
                    jest.spyOn(penaltyWoodWorkService, 'isInvalidHomeOrAwayResult').mockReturnValue(false);

                    const maps = service.getGroupBetType(resultDetails);

                    const expectedResult: ResultDetail[] = [];
                    expectedResult.push(home);
                    expectedResult.push(away);
                    expectedResult.push(CreateDataTest.FakeData(BetTypes.PenaltyWoodwork, 1,
                        ResultValue.NotTaken, ResultValue.NotTaken, 0, false, false, true));
                    const expectedMaps: GroupMap[] = [];
                    const map = new GroupMap(1, expectedResult);
                    expectedMaps.push(map);

                    expect(maps).toEqual(expectedMaps);
                });
        });

        describe('renderSettleDetermined', () => {
            it('Should return expected resultDetail when settlementStatusId = running', () => {
                const resultDetails: ResultDetail[] = [];
                const resultDetail = CreateDataTest.FakeData(
                    BetTypes.PenaltyShootout1X2, 1, "", "", 0, false, false, false);
                resultDetails.push(resultDetail);
                jest.spyOn(penaltyService, 'isSelectedNotTaken').mockReturnValue(true);
                const maps = service.getGroupBetType(resultDetails);

                const expectedResult: ResultDetail[] = [];
                expectedResult.push(CreateDataTest.FakeData(
                    BetTypes.PenaltyShootout1X2, 1, "", "", 0, true, false, true));
                const expectedMaps: GroupMap[] = [];
                const map = new GroupMap(1, expectedResult);
                expectedMaps.push(map);

                expect(maps).toEqual(expectedMaps);
            });

            it('Should return expected resultDetail when settlementStatusId != running', () => {
                const resultDetails: ResultDetail[] = [];
                const resultDetail = CreateDataTest.FakeData(
                    BetTypes.PenaltyShootout1X2, 1, "", "", 7, false, false, false);
                resultDetails.push(resultDetail);
                jest.spyOn(penaltyService, 'isSelectedNotTaken').mockReturnValue(true);
                const maps = service.getGroupBetType(resultDetails);

                const expectedResult: ResultDetail[] = [];
                expectedResult.push(CreateDataTest.FakeData(
                    BetTypes.PenaltyShootout1X2, 1, "", "", 7, true, false, false));
                const expectedMaps: GroupMap[] = [];
                const map = new GroupMap(1, expectedResult);
                expectedMaps.push(map);

                expect(maps).toEqual(expectedMaps);
            });

        });

        describe('autoFillResultPenaltyShootoutFirstTen', () => {
            it('Should call resetValueOnFirstTen on AutoFillService when home and away are empty and settlementStatusId = Running ', () => {
                const resultDetails: ResultDetail[] = [];
                const resultDetail = CreateDataTest.FakeData(
                    BetTypes.PenaltyShootoutOddEven, 1, "", "", 0, false, false, false);
                resultDetails.push(resultDetail);
                jest.spyOn(autoFillService, 'resetValueOnFirstTen');
                service.getGroupBetType(resultDetails);
                expect(autoFillService.resetValueOnFirstTen).toHaveBeenCalled();
            });

            it('Should return expected resultDetail when bettype = Penalty Shootout Home Score - First 10', () => {
                const resultDetails: ResultDetail[] = [];
                const resultDetail = CreateDataTest.FakeData(
                    BetTypes.PenaltyShootoutHomeScore, 1, "1", "2", 7, false, false, false);
                resultDetails.push(resultDetail);
                jest.spyOn(penaltyService, 'countHomePenaltyShooutoutByScore').mockReturnValue("1");
                const maps = service.getGroupBetType(resultDetails);

                const expectedResult: ResultDetail[] = [];
                expectedResult.push(CreateDataTest.FakeData(
                    BetTypes.PenaltyShootoutHomeScore, 1, "1", "2", 7, true, false, false));
                const expectedMaps: GroupMap[] = [];
                const map = new GroupMap(1, expectedResult);
                expectedMaps.push(map);

                expect(maps).toEqual(expectedMaps);
            });

            it('Should return expected resultDetail when bettype = Penalty Shootout Away Score - First 10', () => {
                const resultDetails: ResultDetail[] = [];
                const resultDetail = CreateDataTest.FakeData(
                    BetTypes.PenaltyShootoutAwayScore, 1, "1", "2", 7, false, false, false);
                resultDetails.push(resultDetail);
                const maps = service.getGroupBetType(resultDetails);

                const expectedResult: ResultDetail[] = [];
                expectedResult.push(CreateDataTest.FakeData(
                    BetTypes.PenaltyShootoutAwayScore, 1, "1", "2", 7, true, true, false));
                const expectedMaps: GroupMap[] = [];
                const map = new GroupMap(1, expectedResult);
                expectedMaps.push(map);

                expect(maps).toEqual(expectedMaps);
            });

            it('Should return expected resultDetail when bettype = PenaltyShootoutExactTotalGoals', () => {
                const resultDetails: ResultDetail[] = [];
                const resultDetail = CreateDataTest.FakeData(
                    BetTypes.PenaltyShootoutExactTotalGoals, 1, "1", "2", 7, false, false, false);
                resultDetails.push(resultDetail);
                jest.spyOn(penaltyService, 'countHomePenaltyShooutoutByScore').mockReturnValue("1");
                jest.spyOn(penaltyService, 'countAwayPenaltyShooutoutByScore').mockReturnValue("2");
                const maps = service.getGroupBetType(resultDetails);

                const expectedResult: ResultDetail[] = [];
                expectedResult.push(CreateDataTest.FakeData(
                    BetTypes.PenaltyShootoutExactTotalGoals, 1, "1", "2", 7, true, false, false));
                const expectedMaps: GroupMap[] = [];
                const map = new GroupMap(1, expectedResult);
                expectedMaps.push(map);

                expect(maps).toEqual(expectedMaps);
            });

            it('Should return expected resultDetail when bettype = PenaltyShootoutOddEven', () => {
                const resultDetails: ResultDetail[] = [];
                const resultDetail = CreateDataTest.FakeData(
                    BetTypes.PenaltyShootoutOddEven, 1, "1", "2", 1, false, false, false);
                resultDetails.push(resultDetail);
                jest.spyOn(penaltyService, 'countHomePenaltyShooutoutByScore').mockReturnValue("1");
                jest.spyOn(penaltyService, 'countAwayPenaltyShooutoutByScore').mockReturnValue("2");
                const maps = service.getGroupBetType(resultDetails);

                const expectedResult: ResultDetail[] = [];
                expectedResult.push(CreateDataTest.FakeData(
                    BetTypes.PenaltyShootoutOddEven, 1, "1", "2", 1, false, false, false));
                const expectedMaps: GroupMap[] = [];
                const map = new GroupMap(1, expectedResult);
                expectedMaps.push(map);

                expect(maps).toEqual(expectedMaps);
            });
        });
    });
});