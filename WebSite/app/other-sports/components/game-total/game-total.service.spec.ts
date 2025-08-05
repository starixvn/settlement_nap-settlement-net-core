import { TestBed, inject } from '@angular/core/testing';
import { jest } from '@jest/globals';
import { HttpClient, HttpClientModule, HttpHandler } from '@angular/common/http';
import { HttpRequestService, BlockUIService, MessageBoxService, ClosePopupService, AioService } from '../../../shared/services';
import { IntervalBackgroundPipe } from '../../../shared/pipes/interval-background.pipe';
import { GameTotalService } from './game-total.service';
import { ResourceNameByIdPipe } from '../../pipes/resource-name-by-id.pipe';
import { ResultDetail } from '../../../shared/models/sportsbook-sop';
import * as _ from 'lodash';
import { ResourcesIds } from '../../constants';
import { CalculateAction, SettlementStatusId } from '../../../shared/constants';
import { of } from 'rxjs';
import { Language } from '../../../shared/language.native';

describe('GameTotalService', () => {
    let service: GameTotalService = null;
    let httpRequestService: HttpRequestService;
    let messageBoxService: MessageBoxService;
    let intervalBackgroundPipe: IntervalBackgroundPipe;
    let aioService: AioService;
    let closePopupService: ClosePopupService;

    const resultDetail = new ResultDetail();
    resultDetail.resourceId = "0101";
    resultDetail.homeValue = '1';
    resultDetail.awayValue = '1';
    const totalSet = new ResultDetail();
    totalSet.resourceId = ResourcesIds.totalSets;
    const successfulResult = {
        errCode: 0,
        errMsg: "",
        isSuccessful: true,
    };

    const unsuccessfulResult = {
        errCode: 1,
        errMsg: "error message",
        isSuccessful: false,
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                GameTotalService,
                ClosePopupService,
                AioService,
                BlockUIService,
                MessageBoxService,
                IntervalBackgroundPipe,
                ResourceNameByIdPipe,
                HttpRequestService,
                HttpClient,
                HttpHandler,
            ],
            imports: [
                HttpClientModule,
            ],
        });

        service = TestBed.inject(GameTotalService);
        httpRequestService = TestBed.inject(HttpRequestService);
        messageBoxService = TestBed.inject(MessageBoxService);
        intervalBackgroundPipe = TestBed.inject(IntervalBackgroundPipe);
        aioService = TestBed.inject(AioService);
        closePopupService = TestBed.inject(ClosePopupService);
    });

    beforeEach(inject([GameTotalService], (Service: GameTotalService) => {
        service = Service;
    }));

    it('should create a service', () => {
        expect(service).toBeTruthy();
    });

    describe('getResultDetail', () => {
        it('should add result total point into list with status is refund when totalSet is refund', () => {
            totalSet.settlementStatusId = SettlementStatusId.Refund;

            const listReturn = service.getResultDetail([resultDetail, totalSet]);

            expect(listReturn.length).toEqual(3);
            expect(listReturn[1].resourceId).toEqual(ResourcesIds.totalPoints);
            expect(listReturn[1].settlementStatusId).toEqual(SettlementStatusId.Refund);
        });

        it('should add result total point into list with correct value', () => {
            totalSet.settlementStatusId = SettlementStatusId.Running;
            const resultTemp = _.cloneDeep(resultDetail);
            resultDetail.homeValue = '1';
            resultDetail.awayValue = '1';
            resultTemp.homeValue = '2';
            resultTemp.awayValue = '1';

            const listReturn = service.getResultDetail([resultDetail, resultTemp, totalSet]);

            expect(listReturn.length).toEqual(4);
            expect(listReturn[2].homeValue).toEqual('3');
            expect(listReturn[2].awayValue).toEqual('2');
        });
    });

    it('resetHomeAway - should reset home away score when result status is refund', () => {
        totalSet.settlementStatusId = SettlementStatusId.Refund;
        resultDetail.settlementStatusId = SettlementStatusId.Running;
        resultDetail.homeValue = '1';
        resultDetail.awayValue = '1';

        service.resetHomeAway([resultDetail, totalSet], true);

        expect(resultDetail.homeValue).toEqual('1');
        expect(resultDetail.awayValue).toEqual('1');
        expect(totalSet.homeValue).toEqual('');
        expect(totalSet.awayValue).toEqual('');
    });

    it('changeTotalPoints - should recompute total point when set changed', () => {
        const resultTemp = _.cloneDeep(resultDetail);
        totalSet.homeValue = '1';
        totalSet.awayValue = '1';
        resultDetail.homeValue = '1';
        resultDetail.awayValue = '1';
        resultTemp.homeValue = '2';
        resultTemp.awayValue = '1';

        const totalPoint = service.changeTotalPoints([resultDetail, resultTemp, totalSet]);

        expect(totalPoint.homeValue).toEqual('3');
        expect(totalPoint.awayValue).toEqual('2');
    });

    it('computeTotalSets - should return correct total set', () => {
        const resultTemp = _.cloneDeep(resultDetail);
        totalSet.homeValue = '1';
        totalSet.awayValue = '1';
        resultDetail.homeValue = '1';
        resultDetail.awayValue = '1';
        resultTemp.homeValue = '2';
        resultTemp.awayValue = '1';

        const totalSetAfterChanged = service.computeTotalSets([resultDetail, resultTemp, totalSet]);

        expect(totalSetAfterChanged.homeValue).toEqual('1');
        expect(totalSetAfterChanged.awayValue).toEqual('0');
    });

    it('getConfirmMessage - return correct message', () => {
        totalSet.homeValue = '1';
        totalSet.awayValue = '1';
        resultDetail.resourceId = '0101';
        resultDetail.homeValue = '2';
        resultDetail.awayValue = '1';
        const expected = Language.CalculationConfirmMessage + "<br/>"
            + Language.CalculationAdditionalConfirmation + "<br/>"
            + "Set 1: 2-1<br/>"
            + "Total Sets: 1-1<br/>";

        const actual = service.getConfirmMessage([resultDetail, totalSet])

        expect(actual).toEqual(expected);
    });

    it('getClass - return correct class name', () => {
        const totalPoints = _.cloneDeep(totalSet);
        totalPoints.resourceId = ResourcesIds.totalPoints;
        jest.spyOn(intervalBackgroundPipe, 'transform');

        totalPoints.className = service.getClass(totalPoints);
        totalSet.className = service.getClass(totalSet);

        expect(intervalBackgroundPipe.transform).toHaveBeenCalled();
        expect(totalPoints.className).toContain('total-point ');
        expect(totalSet.className).toContain('final-score ');
    })
});