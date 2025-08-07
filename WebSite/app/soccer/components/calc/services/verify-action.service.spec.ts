
import {  TestBed } from '@angular/core/testing';
import { VerifyScoreGoalService } from './verify-score-goal.service';
import { RequestService } from './request.service';
import { VerifyActionService } from './verify-action.service';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../../../shared/services';
import { HttpClientModule } from '@angular/common/http';
import { CreateDataTest } from './create-data-test.native';
import { TicketStatusText } from '../../../../shared/constants';
import { ResourceIds } from '../../../constants';
import { ResultDetail } from '../../../../shared/models/sportsbook-sop';
describe('Soccer - verify action service', () => {
    let service: VerifyActionService;
    let verifyScoreGoalService: VerifyScoreGoalService;
    let requestService: RequestService;
    const matchDetail = CreateDataTest.MatchDetail();

    const halftime = { resourceId: ResourceIds.halfTime} as ResultDetail;
    const fulltime = { resourceId: ResourceIds.fullTime} as ResultDetail;

    beforeEach(() => TestBed.configureTestingModule({
        providers: [
            VerifyActionService,
            VerifyScoreGoalService,
            RequestService,
            HttpRequestService,
            BlockUIService,
            MessageBoxService,
        ],
        imports: [
            HttpClientModule
        ]
    }));

    beforeEach(() => {
        service = TestBed.inject(VerifyActionService);
        verifyScoreGoalService = TestBed.inject(VerifyScoreGoalService);
        requestService = TestBed.inject(RequestService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('isScoreChangedFirstHalf', () => {
        it('should return false when ht status not equal calculated', async () => {
            matchDetail.htStatus = TicketStatusText.running;
            jest.spyOn(requestService, 'getLastestMatchResult').mockReturnValue(Promise.resolve(matchDetail));

            const actual = await service.isScoreChangedFirstHalf(matchDetail, false, halftime);

            expect(actual).toBeFalsy();
        });

        it('should return true when verify bet status return true', async () => {
            matchDetail.htStatus = TicketStatusText.calculated;
            jest.spyOn(requestService, 'getLastestMatchResult').mockReturnValue(Promise.resolve(matchDetail));
            jest.spyOn(verifyScoreGoalService, 'isSettledFirstHalf').mockReturnValue(true);

            const actual = await service.isScoreChangedFirstHalf(matchDetail, false, halftime);

            expect(actual).toBeTruthy();
        });

        it('should return true when result changed', async () => {
            matchDetail.htStatus = TicketStatusText.calculated;
            jest.spyOn(requestService, 'getLastestMatchResult').mockReturnValue(Promise.resolve(matchDetail));
            jest.spyOn(verifyScoreGoalService, 'isSettledFirstHalf').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isResultChangedFirstHalf').mockReturnValue(true);

            const actual = await service.isScoreChangedFirstHalf(matchDetail, false, halftime);

            expect(actual).toBeTruthy();
        });

        it('should return true when goal record ht changed', async () => {
            matchDetail.htStatus = TicketStatusText.calculated;
            jest.spyOn(requestService, 'getLastestMatchResult').mockReturnValue(Promise.resolve(matchDetail));
            jest.spyOn(verifyScoreGoalService, 'isSettledFirstHalf').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isResultChangedFirstHalf').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isGoalRecordChangedFirstHalf').mockReturnValue(true);

            const actual = await service.isScoreChangedFirstHalf(matchDetail, false, halftime);

            expect(actual).toBeTruthy();
        });
    });

    describe('isScoreChangedFullTime', () => {
        it('should return false when ft status not equal calculated', async () => {
            matchDetail.ftStatus = TicketStatusText.running;
            jest.spyOn(requestService, 'getLastestMatchResult').mockReturnValue(Promise.resolve(matchDetail));
            jest.spyOn(verifyScoreGoalService, 'isSettledFullTime').mockReturnValue(true);

            const actual = await service.isScoreChangedFullTime(matchDetail, false, fulltime);

            expect(actual).toBeFalsy();
        });
        it(' should return true when verify bet status return true', async () => {
            matchDetail.ftStatus = TicketStatusText.calculated;
            jest.spyOn(requestService, 'getLastestMatchResult').mockReturnValue(Promise.resolve(matchDetail));
            jest.spyOn(verifyScoreGoalService, 'isSettledFullTime').mockReturnValue(true);

            const actual = await service.isScoreChangedFullTime(matchDetail, false, fulltime);

            expect(actual).toBeTruthy();
        });

        it('should return true when result changed', async () => {
            matchDetail.ftStatus = TicketStatusText.calculated;
            jest.spyOn(requestService, 'getLastestMatchResult').mockReturnValue(Promise.resolve(matchDetail));
            jest.spyOn(verifyScoreGoalService, 'isSettledFullTime').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isResultChangedFullTime').mockReturnValue(true);

            const actual = await service.isScoreChangedFullTime(matchDetail, false, fulltime);

            expect(actual).toBeTruthy();
        });

        it('should return true when goal record changed', async () => {
            matchDetail.ftStatus = TicketStatusText.calculated;
            jest.spyOn(requestService, 'getLastestMatchResult').mockReturnValue(Promise.resolve(matchDetail));
            jest.spyOn(verifyScoreGoalService, 'isSettledFullTime').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isResultChangedFullTime').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isGoalRecordChangedFullTime').mockReturnValue(true);

            const actual = await service.isScoreChangedFullTime(matchDetail, false, fulltime);

            expect(actual).toBeTruthy();
        });
    });

    describe('isScoreChangedAll', () => {
        it('should return false when ft status not equal calculated', async () => {
            matchDetail.htStatus = TicketStatusText.running;
            matchDetail.ftStatus = TicketStatusText.running;
            jest.spyOn(requestService, 'getLastestMatchResult').mockReturnValue(Promise.resolve(matchDetail));
            jest.spyOn(verifyScoreGoalService, 'isSettledAll').mockReturnValue(true);

            const actual = await service.isScoreChangedAll(matchDetail, false, halftime, fulltime);

            expect(actual).toBeFalsy();
        });

        it('should return false when ht status not equal calculated', async () => {
            matchDetail.htStatus = TicketStatusText.running;
            jest.spyOn(requestService, 'getLastestMatchResult').mockReturnValue(Promise.resolve(matchDetail));
            jest.spyOn(verifyScoreGoalService, 'isSettledAll').mockReturnValue(true);

            const actual = await service.isScoreChangedAll(matchDetail, false, halftime, fulltime);

            expect(actual).toBeFalsy();
        });
        it(' should return true when verify bet status return true', async () => {
            matchDetail.ftStatus = TicketStatusText.calculated;
            matchDetail.htStatus = TicketStatusText.calculated;
            jest.spyOn(requestService, 'getLastestMatchResult').mockReturnValue(Promise.resolve(matchDetail));
            jest.spyOn(verifyScoreGoalService, 'isSettledAll').mockReturnValue(true);

            const actual = await service.isScoreChangedAll(matchDetail, false, halftime, fulltime);

            expect(actual).toBeTruthy();
        });

        it('should return true when result HT changed', async () => {
            matchDetail.ftStatus = TicketStatusText.calculated;
            jest.spyOn(requestService, 'getLastestMatchResult').mockReturnValue(Promise.resolve(matchDetail));
            jest.spyOn(verifyScoreGoalService, 'isSettledAll').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isResultChangedFirstHalf').mockReturnValue(true);

            const actual = await service.isScoreChangedAll(matchDetail, false, halftime, fulltime);

            expect(actual).toBeTruthy();
            matchDetail.htStatus = TicketStatusText.calculated;
        });

        it('should return true when result FT  changed', async () => {
            matchDetail.ftStatus = TicketStatusText.calculated;
            jest.spyOn(requestService, 'getLastestMatchResult').mockReturnValue(Promise.resolve(matchDetail));
            jest.spyOn(verifyScoreGoalService, 'isSettledAll').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isResultChangedFirstHalf').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isResultChangedFullTime').mockReturnValue(true);

            const actual = await service.isScoreChangedAll(matchDetail, false, halftime, fulltime);

            expect(actual).toBeTruthy();
            matchDetail.htStatus = TicketStatusText.calculated;
        });

        it('should return true when goal record changed', async () => {
            matchDetail.ftStatus = TicketStatusText.calculated;
            matchDetail.htStatus = TicketStatusText.calculated;
            jest.spyOn(requestService, 'getLastestMatchResult').mockReturnValue(Promise.resolve(matchDetail));
            jest.spyOn(verifyScoreGoalService, 'isSettledAll').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isResultChangedFirstHalf').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isResultChangedFullTime').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isGoalRecordChangedAll').mockReturnValue(true);

            const actual = await service.isScoreChangedAll(matchDetail, false, halftime, fulltime);

            expect(actual).toBeTruthy();
        });
    });
});

