import { TestBed } from '@angular/core/testing';
import { CreateDataTest } from './create-data-test.native';
import { VerifyScoreGoalService } from './verify-score-goal.service';
import * as _ from "lodash";
import { GoalIcon, ResultDetail } from '../../../models';
import { ChildMatch, FantasyRelatedMatch, MatchDetail } from '../models/match.model';
import { ResourceIds } from '../../../constants';

describe('Soccer - verify score goal', () => {
    let service: VerifyScoreGoalService;
    const matchDetail = CreateDataTest.MatchDetail();
    let lastestMatchDetail = _.cloneDeep(matchDetail);

    const childMatch: ChildMatch = {
        matchId: 1,
        matchCode: '',
        isExistMarkedTicket: false,
        isExistRunningTicket: false,
        isRefund: '',
        eventStatus: '',
        eventStatusColor: '',
        betStatus: '',
        checked: true,
        isPending: false,
        homeName: 'home',
        awayName: 'away',
    }

    const fulltime = { resourceId: ResourceIds.fullTime} as ResultDetail;
    const halftime = { resourceId: ResourceIds.halfTime} as ResultDetail;
    beforeEach(() => TestBed.configureTestingModule({
        providers: [
            VerifyScoreGoalService,
        ],
    }));

    beforeEach(() => {
        service = TestBed.inject(VerifyScoreGoalService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('isSettledFirstHalf', () => {
        it('should return true when bet status firstHalf include refund ht', () => {
            const betStatus = 'Refund HT';

            const actual = service.isSettledFirstHalf(betStatus);

            expect(actual).toBeTruthy();
        });

        it('should return true when bet status firstHalf include refund', () => {
            const betStatus = 'Refund;';

            const actual = service.isSettledFirstHalf(betStatus);

            expect(actual).toBeTruthy();
        });

        it('should return true when bet status firstHalf include Abandoned', () => {
            const betStatus = 'Abandoned 1H';

            const actual = service.isSettledFirstHalf(betStatus);

            expect(actual).toBeTruthy();
        });
    });

    describe('isResultChangedFirstHalf', () => {
        it('should return false when first half score is empty', () => {
            const actual = service.isResultChangedFirstHalf(halftime, lastestMatchDetail);

            expect(actual).toBeFalsy();
        });

        it('should return true when first half score is different from lastest score', () => {
            halftime.homeValue = '1';
            halftime.awayValue = '1';
            lastestMatchDetail = _.cloneDeep(matchDetail);
            lastestMatchDetail.halfTimeHomeScore = '1';
            lastestMatchDetail.halfTimeAwayScore = '2';

            const actual = service.isResultChangedFirstHalf(halftime, lastestMatchDetail);

            expect(actual).toBeTruthy();
        });
    });

    describe('isGoalRecordChangedFirstHalf', () => {
        it('should return false when goalIcon is null', () => {
            lastestMatchDetail.goalIcon = null;

            const actual = service.isGoalRecordChangedFirstHalf(matchDetail, lastestMatchDetail);

            expect(actual).toBeFalsy();
        });

        it('should return false when goal record changed', () => {
            matchDetail.goalRecord = "HA;"
            lastestMatchDetail.goalIcon = new GoalIcon('1', '1', '1', '1');
            lastestMatchDetail.goalRecord = "AH;";

            const actual = service.isGoalRecordChangedFirstHalf(matchDetail, lastestMatchDetail);

            expect(actual).toBeTruthy();
        });
    });

    describe('isSettledFullTime - isSettledAll', () => {
        it('should return true when bet status include refund ft', () => {
            const betStatus = 'Refund FT';

            const actual = service.isSettledFullTime(betStatus);
            const actualSecond = service.isSettledAll(betStatus);

            expect(actual).toBeTruthy();
            expect(actualSecond).toBeTruthy();
        });

        it('should return true when bet status include refund', () => {
            const betStatus = 'Refund;';

            const actual = service.isSettledFullTime(betStatus);

            expect(actual).toBeTruthy();
        });

        it('should return true when bet status include Abandoned', () => {
            const betStatus = 'Abandoned 1H';

            const actual = service.isSettledFullTime(betStatus);
            const actualSecond = service.isSettledAll(betStatus);

            expect(actual).toBeTruthy();
            expect(actualSecond).toBeTruthy();
        });
    });

    describe('isResultChangedFullTime', () => {
        it('should return false when final value is not changed', () => {
            fulltime.homeValue = '1';
            fulltime.awayValue = '2';
            matchDetail.finalHomeScore = '1';
            matchDetail.finalAwayScore = '2';

            const actual = service.isResultChangedFullTime(fulltime, lastestMatchDetail);
            expect(actual).toBe(false);
        });

        it('should return true when final value is changed', () => {
            lastestMatchDetail.finalHomeScore = '1';
            lastestMatchDetail.finalAwayScore = '2';
            fulltime.homeValue = '2';
            fulltime.awayValue = '1';

            const actual = service.isResultChangedFullTime(fulltime, lastestMatchDetail);
            expect(actual).toBe(true);
        });
    });

    describe('isGoalRecordChangedFullTime', () => {
        it('should return false when goalRecord value is not changed', () => {
            lastestMatchDetail.goalRecord = "AH;H";
            matchDetail.goalRecord = "AH;H";

            const actual = service.isGoalRecordChangedFullTime(matchDetail, lastestMatchDetail);
            expect(actual).toBe(false);
        });

        it('should return true when goalRecord value is changed', () => {
            lastestMatchDetail.goalRecord = "AH;H";
            matchDetail.goalRecord = "AH;A";

            const actual = service.isGoalRecordChangedFullTime(matchDetail, lastestMatchDetail);
            expect(actual).toBe(true);
        });
    });

    describe('isGoalRecordChangedAll', () => {
        it('should return false when goal record halfTime changed but ht status is running', () => {
            matchDetail.goalRecord = 'HA;HA';
            lastestMatchDetail.goalRecord = 'HH;HA';
            lastestMatchDetail.htStatus = 'Running';
            matchDetail.applyGoalRecord = true;

            const actual = service.isGoalRecordChangedAll(matchDetail, lastestMatchDetail);

            expect(actual).toBeFalsy();
        });

        it('should return true when goal record halfTime changed but ht status is calculated', () => {
            matchDetail.goalRecord = 'HA;HA';
            lastestMatchDetail.goalRecord = 'HH;HA';
            lastestMatchDetail.htStatus = 'Calculated';
            matchDetail.applyGoalRecord = true;

            const actual = service.isGoalRecordChangedAll(matchDetail, lastestMatchDetail);

            expect(actual).toBeTruthy();
        });

        it('should return true when goal record full time changed but ht status is calculated', () => {
            matchDetail.goalRecord = 'HA;HA';
            lastestMatchDetail.goalRecord = 'HA;HH';
            lastestMatchDetail.htStatus = 'Calculated';
            lastestMatchDetail.ftStatus = 'Calculated';
            matchDetail.applyGoalRecord = true;

            const actual = service.isGoalRecordChangedAll(matchDetail, lastestMatchDetail);

            expect(actual).toBeTruthy();
        });

        it('should return false when goal record full time changed but ht status is Running', () => {
            matchDetail.goalRecord = 'HA;HA';
            lastestMatchDetail.goalRecord = 'HA;HH';
            lastestMatchDetail.htStatus = 'Calculated';
            lastestMatchDetail.ftStatus = 'Running';
            matchDetail.applyGoalRecord = true;

            const actual = service.isGoalRecordChangedAll(matchDetail, lastestMatchDetail);

            expect(actual).toBeFalsy();
        });

        it('should return false when goal record lastest is null', () => {
            matchDetail.goalRecord = 'HA;HA';
            lastestMatchDetail.goalRecord = null;
            matchDetail.applyGoalRecord = true;

            const actual = service.isGoalRecordChangedAll(matchDetail, lastestMatchDetail);

            expect(actual).toBeFalsy();
        });

        it('should return false when match not apply goal recored', () => {
            lastestMatchDetail.goalRecord = 'HA;HA';
            matchDetail.applyGoalRecord = false;

            const actual = service.isGoalRecordChangedAll(matchDetail, lastestMatchDetail);

            expect(actual).toBeFalsy();
        });
    });

    describe('isHalfTimeSettled', () => {
        it('should return true when isHalfTimeCal is true', () => {
            matchDetail.isHalfTimeCal = true;

            const actual = service.isHalfTimeSettled(matchDetail);

            expect(actual).toBeTruthy();
        });

        it('should return true when bet status include refund ht', () => {
            matchDetail.isHalfTimeCal = false;
            matchDetail.betStatus = "Refund HT;";

            const actual = service.isHalfTimeSettled(matchDetail);

            expect(actual).toBeTruthy();
        });

        it('should return false when bet status is empty', () => {
            matchDetail.isHalfTimeCal = false;
            matchDetail.betStatus = "";

            const actual = service.isHalfTimeSettled(matchDetail);

            expect(actual).toBeFalsy();
        });
    });

    describe('isFullTimeSettled', () => {
        it('should return true when isHalfTimeCal is true', () => {
            matchDetail.isCalculated = true;

            const actual = service.isFullTimeSettled(matchDetail);

            expect(actual).toBeTruthy();
        });

        it('should return true when bet status include refund', () => {
            matchDetail.isCalculated = false;
            matchDetail.betStatus = "Refund ";

            const actual = service.isFullTimeSettled(matchDetail);

            expect(actual).toBeTruthy();
        });

        it('should return true when bet status include abandoned', () => {
            matchDetail.isCalculated = false;
            matchDetail.betStatus = "Abandoned ";

            const actual = service.isFullTimeSettled(matchDetail);

            expect(actual).toBeTruthy();
        });

        it('should return false when bet status is empty', () => {
            matchDetail.isCalculated = false;
            matchDetail.betStatus = "";

            const actual = service.isFullTimeSettled(matchDetail);

            expect(actual).toBeFalsy();
        });
    });

    describe('isRefundHalfTime', () => {
        it('should return false when bet status not include refund ht;', () => {
            matchDetail.goalRecord = "H;";
            matchDetail.betStatus = "Refund";

            const actual = service.isRefundHalfTime(matchDetail);

            expect(actual).toBeFalsy();
        });

        it('should return true when bet status include refund ht; and goal record has semicolon', () => {
            matchDetail.goalRecord = "H;";
            matchDetail.betStatus = "Refund HT;";

            const actual = service.isRefundHalfTime(matchDetail);

            expect(actual).toBeTruthy();
        });
    });

    it('sumScoreAndAutoFill - should return correct score', () => {
        const fantasyRelatedMatch: FantasyRelatedMatch = {
            matchId: 1,
            matchCode: 'test',
            kickOffTime: '',
            homeId: 1,
            awayId: 2,
            homeName: 'Home',
            awayName: 'Away',
            htHomeScore: 1,
            htAwayScore: 2,
            finalAwayScore: 3,
            finalHomeScore: 4,
            remark: null,
            eventStatus: '',
            betStatus: '',
            isDeleted: false,
            ftSettlementStatusId: 0,
            htSettlementStatusId: 0

        }
        const homeTeams = ['1', '2'];
        const awayTeams = ['1', '2'];

        const score = service.sumScoreAndAutoFill(homeTeams, awayTeams, [fantasyRelatedMatch]);

        expect(score.halfTimeHomeScore).toEqual(3);
        expect(score.halfTimeAwayScore).toEqual(3);
        expect(score.finalAwayScore).toEqual(7);
        expect(score.finalHomeScore).toEqual(7);
    });

    it('isScoresValid - should return true when scores are valid', () => {
        expect(service.isScoresValid('1', '2')).toBeTruthy();
        expect(service.isScoresValid(null, '2')).toBeFalsy();
    });

    describe('verifyScoreForChildMatch', () => {
        it('should return false when not exist child match selected', () => {
            expect(service.verifyScoreForChildMatch(matchDetail, [])).toBeFalsy();
        });

        it('should return true when home score equal away score', () => {
            matchDetail.finalAwayScore = '1';
            matchDetail.finalHomeScore = '1';

            expect(service.verifyScoreForChildMatch(matchDetail, [childMatch])).toBeTruthy();
        });

    });

    describe('verifyScore', () => {
        it('should return true and set warnings for half time when home score is empty', () => {
            const resultDetail = { homeValue: '', awayValue: '1' } as ResultDetail;

            const actual = service.verifyScore(resultDetail, matchDetail, true);

            expect(actual).toBeTruthy();
            expect(matchDetail.isWarningHalfTimeHomeScore).toBeTruthy();
            expect(matchDetail.isWarningHalfTimeAwayScore).toBeFalsy();
        });

        it('should return true and set warnings for half time when away score is empty', () => {
            const resultDetail = { homeValue: '1', awayValue: '' } as ResultDetail;

            const actual = service.verifyScore(resultDetail, matchDetail, true);

            expect(actual).toBeTruthy();
            expect(matchDetail.isWarningHalfTimeHomeScore).toBeFalsy();
            expect(matchDetail.isWarningHalfTimeAwayScore).toBeTruthy();
        });

        it('should return true and set warnings for full time when home score is empty', () => {
            const resultDetail = { homeValue: '', awayValue: '1' } as ResultDetail;

            const actual = service.verifyScore(resultDetail, matchDetail, false);

            expect(actual).toBeTruthy();
            expect(matchDetail.isWarningFinalHomeScore).toBeTruthy();
            expect(matchDetail.isWarningFinalAwayScore).toBeFalsy();
        });

        it('should return true and set warnings for full time when away score is empty', () => {
            const resultDetail = { homeValue: '1', awayValue: '' } as ResultDetail;

            const actual = service.verifyScore(resultDetail, matchDetail, false);

            expect(actual).toBeTruthy();
            expect(matchDetail.isWarningFinalHomeScore).toBeFalsy();
            expect(matchDetail.isWarningFinalAwayScore).toBeTruthy();
        });

        it('should return false when both scores are not empty', () => {
            const resultDetail = { homeValue: '1', awayValue: '1' } as ResultDetail;

            const actual = service.verifyScore(resultDetail, matchDetail);

            expect(actual).toBeFalsy();
        });
    });

});