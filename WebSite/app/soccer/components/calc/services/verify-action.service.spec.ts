
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { VerifyScoreGoalService } from './verify-score-goal.service';
import { RequestService } from './request.service';
import { VerifyActionService } from './verify-action.service';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../../../shared/services';
import { HttpClientModule } from '@angular/common/http';
import { CreateDataTest } from './create-data-test.native';
import { Language } from '../../../../shared/language.native';
import { Result } from '../../../../shared/models';
import { of } from 'rxjs';
import { TicketStatusText } from '../../../../shared/constants';
import { ChildMatch, FantasyRelatedMatch } from '../models/match.model';
describe('Soccer - verify action service', () => {
    let service: VerifyActionService;
    let verifyScoreGoalService: VerifyScoreGoalService;
    let requestService: RequestService;
    const matchDetail = CreateDataTest.MatchDetail();

    const unSuccessfulResult: Result = {
        errCode: 1,
        errMsg: "errorMessage",
        isSuccessful: false,
        childMatchIds: '',
        settledSessionId: "",
        hasResultAmendment: false
    };

    const successfulResult = {
        errCode: 0,
        errMsg: "",
        isSuccessful: true,
        childMatchIds: '',
        settledSessionId: "",
        hasResultAmendment: false
    };

    const childMatch: ChildMatch = {
        matchId: 1,
        matchCode: 'string',
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

    describe('verifyFirstHalf', () => {
        it('should return message waring about input score when input score is empty', fakeAsync(async () => {
            matchDetail.halfTimeAwayScore = 0;
            matchDetail.halfTimeHomeScore = null;

            const actual = await service.verifyFirstHalf(matchDetail,[]);
            tick();

            expect(actual).toEqual(Language.warningInputScore);
            expect(matchDetail.isWarningHalfTimeAwayScore).toBeFalsy();
            expect(matchDetail.isWarningHalfTimeHomeScore).toBeTruthy();
        }));

        it('should return message warning goal record when missing semicolon', fakeAsync(async () => {
            matchDetail.halfTimeAwayScore = 2;
            matchDetail.halfTimeHomeScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = "HAA"

            const actual = await service.verifyFirstHalf(matchDetail,[]);
            tick();

            expect(actual).toEqual(Language.soccer.needSemicolonOnGoalRecord);
            expect(matchDetail.isWarningGoalRecord).toBeTruthy();
        }));

        it('should return message warning goal record when goal record not valid', fakeAsync(async () => {
            matchDetail.halfTimeAwayScore = 0;
            matchDetail.halfTimeHomeScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = "H;"
            jest.spyOn(verifyScoreGoalService, 'isHtGoalRecordInvalid').mockReturnValue(true);

            const actual = await service.verifyFirstHalf(matchDetail, []);
            tick();

            expect(actual).toEqual(Language.soccer.halfTimeGoalRecordNotConsistent);
            expect(matchDetail.isWarningGoalRecord).toBeTruthy();
        }));

        it('should return message warning when score inconsistent', fakeAsync(async () => {
            matchDetail.halfTimeAwayScore = 0;
            matchDetail.halfTimeHomeScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = "H;"
            jest.spyOn(verifyScoreGoalService, 'isHtGoalRecordInvalid').mockReturnValue(false);
            matchDetail.isScoreInconsistent = true;

            const actual = await service.verifyFirstHalf(matchDetail, []);
            tick();

            expect(actual).toEqual(Language.soccer.confirmWithInconsistentScore);
        }));

        it('should return message warning when match is Fantasy', fakeAsync(async () => {
            matchDetail.halfTimeAwayScore = 0;
            matchDetail.halfTimeHomeScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = "H;"
            jest.spyOn(verifyScoreGoalService, 'isHtGoalRecordInvalid').mockReturnValue(false);
            matchDetail.isScoreInconsistent = false;
            matchDetail.isFantasyMatch = true;

            const relatedMatches: FantasyRelatedMatch = CreateDataTest.FantasyMatch();
            const actual = await service.verifyFirstHalf(matchDetail, [relatedMatches]);
            tick();

            expect(actual).toEqual(Language.fantasyMatch.relatedMatchesNotCalc);
        }));

        it('should return message warning when check new status return false', fakeAsync(async () => {
            matchDetail.halfTimeAwayScore = 0;
            matchDetail.halfTimeHomeScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = "H;"
            matchDetail.isScoreInconsistent = false;
            jest.spyOn(verifyScoreGoalService, 'isHtGoalRecordInvalid').mockReturnValue(false);
            jest.spyOn(requestService, 'checkNewStatus').mockReturnValue(Promise.resolve(unSuccessfulResult));

            const actual = await service.verifyFirstHalf(matchDetail, []);
            tick();

            expect(actual).toEqual("errorMessage");
        }));

        it('should return empty when pass all validation', fakeAsync(async () => {
            matchDetail.halfTimeAwayScore = 0;
            matchDetail.halfTimeHomeScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = "H;"
            matchDetail.isScoreInconsistent = false;
            jest.spyOn(verifyScoreGoalService, 'isHtGoalRecordInvalid').mockReturnValue(false);
            jest.spyOn(requestService, 'checkNewStatus').mockReturnValue(Promise.resolve(successfulResult));

            const actual = await service.verifyFirstHalf(matchDetail, []);
            tick();

            expect(actual).toEqual("");
        }));
    });

    describe('isScoreChangedFirstHalf', () => {
        it('should return false when ht status not equal calculated', async () => {
            matchDetail.htStatus = TicketStatusText.running;
            jest.spyOn(requestService, 'getLastestMatchResult').mockReturnValue(Promise.resolve(matchDetail));

            const actual = await service.isScoreChangedFirstHalf(matchDetail, false);

            expect(actual).toBeFalsy();
        });

        it('should return true when verify bet status return true', async () => {
            matchDetail.htStatus = TicketStatusText.calculated;
            jest.spyOn(requestService, 'getLastestMatchResult').mockReturnValue(Promise.resolve(matchDetail));
            jest.spyOn(verifyScoreGoalService, 'isSettledFirstHalf').mockReturnValue(true);

            const actual = await service.isScoreChangedFirstHalf(matchDetail, false);

            expect(actual).toBeTruthy();
        });

        it('should return true when result changed', async () => {
            matchDetail.htStatus = TicketStatusText.calculated;
            jest.spyOn(requestService, 'getLastestMatchResult').mockReturnValue(Promise.resolve(matchDetail));
            jest.spyOn(verifyScoreGoalService, 'isSettledFirstHalf').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isResultChangedFirstHalf').mockReturnValue(true);

            const actual = await service.isScoreChangedFirstHalf(matchDetail, false);

            expect(actual).toBeTruthy();
        });

        it('should return true when goal record ht changed', async () => {
            matchDetail.htStatus = TicketStatusText.calculated;
            jest.spyOn(requestService, 'getLastestMatchResult').mockReturnValue(Promise.resolve(matchDetail));
            jest.spyOn(verifyScoreGoalService, 'isSettledFirstHalf').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isResultChangedFirstHalf').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isGoalRecordChangedFirstHalf').mockReturnValue(true);

            const actual = await service.isScoreChangedFirstHalf(matchDetail, false);

            expect(actual).toBeTruthy();
        });
    });

    describe('isScoreChangedFullTime', () => {
        it('should return false when ft status not equal calculated', async () => {
            matchDetail.ftStatus = TicketStatusText.running;
            jest.spyOn(requestService, 'getLastestMatchResult').mockReturnValue(Promise.resolve(matchDetail));
            jest.spyOn(verifyScoreGoalService, 'isSettledFullTime').mockReturnValue(true);

            const actual = await service.isScoreChangedFullTime(matchDetail, false);

            expect(actual).toBeFalsy();
        });
        it(' should return true when verify bet status return true', async () => {
            matchDetail.ftStatus = TicketStatusText.calculated;
            jest.spyOn(requestService, 'getLastestMatchResult').mockReturnValue(Promise.resolve(matchDetail));
            jest.spyOn(verifyScoreGoalService, 'isSettledFullTime').mockReturnValue(true);

            const actual = await service.isScoreChangedFullTime(matchDetail, false);

            expect(actual).toBeTruthy();
        });

        it('should return true when result changed', async () => {
            matchDetail.ftStatus = TicketStatusText.calculated;
            jest.spyOn(requestService, 'getLastestMatchResult').mockReturnValue(Promise.resolve(matchDetail));
            jest.spyOn(verifyScoreGoalService, 'isSettledFullTime').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isResultChangedFullTime').mockReturnValue(true);

            const actual = await service.isScoreChangedFullTime(matchDetail, false);

            expect(actual).toBeTruthy();
        });

        it('should return true when goal record changed', async () => {
            matchDetail.ftStatus = TicketStatusText.calculated;
            jest.spyOn(requestService, 'getLastestMatchResult').mockReturnValue(Promise.resolve(matchDetail));
            jest.spyOn(verifyScoreGoalService, 'isSettledFullTime').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isResultChangedFullTime').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isGoalRecordChangedFullTime').mockReturnValue(true);

            const actual = await service.isScoreChangedFullTime(matchDetail, false);

            expect(actual).toBeTruthy();
        });
    });

    describe('isScoreChangedAll', () => {
        it('should return false when ft status not equal calculated', async () => {
            matchDetail.htStatus = TicketStatusText.running;
            matchDetail.ftStatus = TicketStatusText.running;
            jest.spyOn(requestService, 'getLastestMatchResult').mockReturnValue(Promise.resolve(matchDetail));
            jest.spyOn(verifyScoreGoalService, 'isSettledAll').mockReturnValue(true);

            const actual = await service.isScoreChangedAll(matchDetail, false);

            expect(actual).toBeFalsy();
        });

        it('should return false when ht status not equal calculated', async () => {
            matchDetail.htStatus = TicketStatusText.running;
            jest.spyOn(requestService, 'getLastestMatchResult').mockReturnValue(Promise.resolve(matchDetail));
            jest.spyOn(verifyScoreGoalService, 'isSettledAll').mockReturnValue(true);

            const actual = await service.isScoreChangedAll(matchDetail, false);

            expect(actual).toBeFalsy();
        });
        it(' should return true when verify bet status return true', async () => {
            matchDetail.ftStatus = TicketStatusText.calculated;
            matchDetail.htStatus = TicketStatusText.calculated;
            jest.spyOn(requestService, 'getLastestMatchResult').mockReturnValue(Promise.resolve(matchDetail));
            jest.spyOn(verifyScoreGoalService, 'isSettledAll').mockReturnValue(true);

            const actual = await service.isScoreChangedAll(matchDetail, false);

            expect(actual).toBeTruthy();
        });

        it('should return true when result HT changed', async () => {
            matchDetail.ftStatus = TicketStatusText.calculated;
            jest.spyOn(requestService, 'getLastestMatchResult').mockReturnValue(Promise.resolve(matchDetail));
            jest.spyOn(verifyScoreGoalService, 'isSettledAll').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isResultChangedFirstHalf').mockReturnValue(true);

            const actual = await service.isScoreChangedAll(matchDetail, false);

            expect(actual).toBeTruthy();
            matchDetail.htStatus = TicketStatusText.calculated;
        });

        it('should return true when result FT  changed', async () => {
            matchDetail.ftStatus = TicketStatusText.calculated;
            jest.spyOn(requestService, 'getLastestMatchResult').mockReturnValue(Promise.resolve(matchDetail));
            jest.spyOn(verifyScoreGoalService, 'isSettledAll').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isResultChangedFirstHalf').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isResultChangedFullTime').mockReturnValue(true);

            const actual = await service.isScoreChangedAll(matchDetail, false);

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

            const actual = await service.isScoreChangedAll(matchDetail, false);

            expect(actual).toBeTruthy();
        });
    });

    describe('verifyFullTime', () => {
        it('should return message waring about input score when input score is empty', fakeAsync(async () => {
            matchDetail.finalHomeScore = 0;
            matchDetail.finalAwayScore = null;

            const actual = await service.verifyFullTime(matchDetail, [], []);
            tick();

            expect(actual).toEqual(Language.warningInputScore);
            expect(matchDetail.isWarningFinalHomeScore).toBeFalsy();
            expect(matchDetail.isWarningFinalAwayScore).toBeTruthy();
        }));

        it('should return message warning child match when scores is same value', fakeAsync(async () => {
            matchDetail.finalHomeScore = 2;
            matchDetail.finalAwayScore = 2;

            const actual = await service.verifyFullTime(matchDetail, [childMatch], []);
            tick();

            expect(actual).toEqual(Language.soccer.childMatchesErrorMessage);
        }));

        it('should return message warning when halftime refunded and goal record include semicolon', fakeAsync(async () => {
            matchDetail.finalHomeScore = 2;
            matchDetail.finalAwayScore = 1;

            jest.spyOn(verifyScoreGoalService, 'isRefundHalfTime').mockReturnValue(true);
            const actual = await service.verifyFullTime(matchDetail, [childMatch], []);
            tick();

            expect(actual).toEqual(Language.soccer.noNeedSemicolonOnGoalRecord);
        }));

        it('should return message warning goal record when missing semicolon', fakeAsync(async () => {
            matchDetail.finalHomeScore = 2;
            matchDetail.finalAwayScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = "HAA";

            jest.spyOn(verifyScoreGoalService, 'isRefundHalfTime').mockReturnValue(false);
            const actual = await service.verifyFullTime(matchDetail, [childMatch],[]);
            tick();

            expect(actual).toEqual(Language.soccer.needSemicolonOnGoalRecord);
            expect(matchDetail.isWarningGoalRecord).toBeTruthy();
        }));

        it('should return message warning goal record when HT goal record not valid', fakeAsync(async () => {
            matchDetail.finalHomeScore = 0;
            matchDetail.finalAwayScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = ";H";

            jest.spyOn(verifyScoreGoalService, 'isRefundHalfTime').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isHTGoalRecordConsistent').mockReturnValue(true);

            const actual = await service.verifyFullTime(matchDetail, [childMatch],[]);
            tick();

            expect(actual).toEqual(Language.soccer.halfTimeGoalRecordNotConsistent);
            expect(matchDetail.isWarningGoalRecord).toBeTruthy();
        }));

        it('should return message warning goal record when goal record not consistent', fakeAsync(async () => {
            matchDetail.finalHomeScore = 0;
            matchDetail.finalAwayScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = ";H";

            jest.spyOn(verifyScoreGoalService, 'isRefundHalfTime').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isHTGoalRecordConsistent').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isFullTimeGoalRecordInvalid').mockReturnValue(true);

            const actual = await service.verifyFullTime(matchDetail, [childMatch],[]);
            tick();

            expect(actual).toEqual(Language.soccer.goalRecordNotConsistent);
        }));

        it('should return message warning when score inconsistent', fakeAsync(async () => {
            matchDetail.halfTimeAwayScore = 0;
            matchDetail.halfTimeHomeScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = "H;"
            matchDetail.isScoreInconsistent = true;

            jest.spyOn(verifyScoreGoalService, 'isFullTimeGoalRecordInvalid').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isRefundHalfTime').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isHTGoalRecordConsistent').mockReturnValue(false);

            const actual = await service.verifyFullTime(matchDetail, [childMatch], []);
            tick();

            expect(actual).toEqual(Language.soccer.incorrectHalftimeAndFullTimeScore);
        }));

        it('should return message warning when match is Fantasy', fakeAsync(async () => {
            matchDetail.halfTimeAwayScore = 0;
            matchDetail.halfTimeHomeScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = "H;"
            matchDetail.isScoreInconsistent = false;
            matchDetail.isFantasyMatch = true;

            jest.spyOn(verifyScoreGoalService, 'isFullTimeGoalRecordInvalid').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isRefundHalfTime').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isHTGoalRecordConsistent').mockReturnValue(false);

            const relatedMatches: FantasyRelatedMatch = CreateDataTest.FantasyMatch();
            const actual = await service.verifyFullTime(matchDetail, [childMatch], [relatedMatches]);
            tick();

            expect(actual).toEqual(Language.fantasyMatch.relatedMatchesNotCalc);
        }));

        it('should return message warning when check new status return false', fakeAsync(async () => {
            matchDetail.halfTimeAwayScore = 0;
            matchDetail.halfTimeHomeScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = "H;"
            matchDetail.isScoreInconsistent = false;

            jest.spyOn(verifyScoreGoalService, 'isFullTimeGoalRecordInvalid').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isRefundHalfTime').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isHTGoalRecordConsistent').mockReturnValue(false);
            jest.spyOn(requestService, 'checkNewStatus').mockReturnValue(Promise.resolve(unSuccessfulResult));

            const actual = await service.verifyFullTime(matchDetail, [childMatch], []);
            tick();

            expect(actual).toEqual("errorMessage");
        }));

        it('should return empty when pass all validation', fakeAsync(async () => {
            matchDetail.halfTimeAwayScore = 0;
            matchDetail.halfTimeHomeScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = "H;"
            matchDetail.isScoreInconsistent = false;

            jest.spyOn(verifyScoreGoalService, 'isFullTimeGoalRecordInvalid').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isRefundHalfTime').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isHTGoalRecordConsistent').mockReturnValue(false);
            jest.spyOn(requestService, 'checkNewStatus').mockReturnValue(Promise.resolve(successfulResult));

            const actual = await service.verifyFullTime(matchDetail, [childMatch], []);
            tick();

            expect(actual).toEqual("");
        }));
    });

    describe('verifyAll', () => {
        it('should return message waring about input score when  HT input score is empty', fakeAsync(async () => {
            matchDetail.halfTimeHomeScore = 0;
            matchDetail.halfTimeAwayScore = null;

            const actual = await service.verifyAll(matchDetail, [], []);
            tick();

            expect(actual).toEqual(Language.warningInputScore);
            expect(matchDetail.isWarningHalfTimeHomeScore).toBeFalsy();
            expect(matchDetail.isWarningHalfTimeAwayScore).toBeTruthy();
        }));
        it('should return message waring about input score when  FT input score is empty', fakeAsync(async () => {
            matchDetail.halfTimeHomeScore = 0;
            matchDetail.halfTimeAwayScore = 1;
            matchDetail.finalHomeScore = 0;
            matchDetail.finalAwayScore = null;

            const actual = await service.verifyAll(matchDetail, [], []);
            tick();

            expect(actual).toEqual(Language.warningInputScore);
            expect(matchDetail.isWarningFinalHomeScore).toBeFalsy();
            expect(matchDetail.isWarningFinalAwayScore).toBeTruthy();
        }));

        it('should return message warning child match when scores is same value', fakeAsync(async () => {
            matchDetail.finalHomeScore = 2;
            matchDetail.finalAwayScore = 2;

            const actual = await service.verifyAll(matchDetail, [childMatch], []);
            tick();

            expect(actual).toEqual(Language.soccer.childMatchesErrorMessage);
        }));

        it('should return message warning goal record when missing semicolon', fakeAsync(async () => {
            matchDetail.finalHomeScore = 2;
            matchDetail.finalAwayScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = "HAA";

            const actual = await service.verifyAll(matchDetail, [childMatch], []);
            tick();

            expect(actual).toEqual(Language.soccer.needSemicolonOnGoalRecord);
            expect(matchDetail.isWarningGoalRecord).toBeTruthy();
        }));

        it('should return message warning goal record when HT goal record not valid', fakeAsync(async () => {
            matchDetail.finalHomeScore = 0;
            matchDetail.finalAwayScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = ";H";

            jest.spyOn(verifyScoreGoalService, 'isHTGoalRecordConsistent').mockReturnValue(true);

            const actual = await service.verifyAll(matchDetail, [childMatch], []);
            tick();

            expect(actual).toEqual(Language.soccer.halfTimeGoalRecordNotConsistent);
            expect(matchDetail.isWarningGoalRecord).toBeTruthy();
        }));

        it('should return message warning goal record when goal record not consistent', fakeAsync(async () => {
            matchDetail.finalHomeScore = 0;
            matchDetail.finalAwayScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = ";H";

            jest.spyOn(verifyScoreGoalService, 'isHTGoalRecordConsistent').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isFullTimeGoalRecordInvalid').mockReturnValue(true);

            const actual = await service.verifyAll(matchDetail, [childMatch], []);
            tick();

            expect(actual).toEqual(Language.soccer.goalRecordNotConsistent);
        }));

        it('should return message warning when score inconsistent', fakeAsync(async () => {
            matchDetail.halfTimeAwayScore = 0;
            matchDetail.halfTimeHomeScore = 3;
            matchDetail.finalHomeScore = 0;
            matchDetail.finalAwayScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = "H;"
            matchDetail.isScoreInconsistent = true;

            jest.spyOn(verifyScoreGoalService, 'isFullTimeGoalRecordInvalid').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isHTGoalRecordConsistent').mockReturnValue(false);

            const actual = await service.verifyAll(matchDetail, [childMatch], []);
            tick();

            expect(actual).toEqual(Language.soccer.incorrectHalftimeAndFullTimeScore);
        }));

        it('should return message warning when match is Fantasy', fakeAsync(async () => {
            matchDetail.halfTimeAwayScore = 0;
            matchDetail.halfTimeHomeScore = 3;
            matchDetail.finalHomeScore = 0;
            matchDetail.finalAwayScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = "H;"
            matchDetail.isScoreInconsistent = false;
            matchDetail.isFantasyMatch = true;

            jest.spyOn(verifyScoreGoalService, 'isFullTimeGoalRecordInvalid').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isHTGoalRecordConsistent').mockReturnValue(false);

            const relatedMatches: FantasyRelatedMatch = CreateDataTest.FantasyMatch();
            const actual = await service.verifyAll(matchDetail, [childMatch], [relatedMatches]);
            tick();

            expect(actual).toEqual(Language.fantasyMatch.relatedMatchesNotCalc);
        }));

        it('should return message warning when check new status return false', fakeAsync(async () => {
            matchDetail.halfTimeAwayScore = 0;
            matchDetail.halfTimeHomeScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = "H;"
            matchDetail.isScoreInconsistent = false;

            jest.spyOn(verifyScoreGoalService, 'isFullTimeGoalRecordInvalid').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isHTGoalRecordConsistent').mockReturnValue(false);
            jest.spyOn(requestService, 'checkNewStatus').mockReturnValue(Promise.resolve(unSuccessfulResult));

            const actual = await service.verifyAll(matchDetail, [childMatch], []);
            tick();

            expect(actual).toEqual("errorMessage");
        }));

        it('should return empty when pass all validation', fakeAsync(async () => {
            matchDetail.halfTimeAwayScore = 0;
            matchDetail.halfTimeHomeScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = "H;"
            matchDetail.isScoreInconsistent = false;

            jest.spyOn(verifyScoreGoalService, 'isFullTimeGoalRecordInvalid').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isRefundHalfTime').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isHTGoalRecordConsistent').mockReturnValue(false);
            jest.spyOn(requestService, 'checkNewStatus').mockReturnValue(Promise.resolve(successfulResult));

            const actual = await service.verifyAll(matchDetail, [childMatch], []);
            tick();

            expect(actual).toEqual("");
        }));
    });
});

