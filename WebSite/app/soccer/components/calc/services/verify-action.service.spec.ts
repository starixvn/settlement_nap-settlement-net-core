
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
import { ChildMatch } from '../models/match.model';
describe('Soccer - verify action service', () => {
    let service: VerifyActionService;
    let verifyScoreGoalService: VerifyScoreGoalService;
    let requestService: RequestService;
    const matchDetail = CreateDataTest.MatchDetail();

    const unSuccessfulResult: Result = {
        errCode: 1,
        errMsg: "errorMessage",
        isSuccessful: false,
        childMatchIds: ''
    };

    const successfulResult = {
        errCode: 0,
        errMsg: "",
        isSuccessful: true,
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

            const actual = await service.verifyFirstHalf(matchDetail);
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

            const actual = await service.verifyFirstHalf(matchDetail);
            tick();

            expect(actual).toEqual(Language.soccer.needSemicolonOnGoalRecord);
            expect(matchDetail.isWarningGoalRecord).toBeTruthy();
        }));

        it('should return message warning goal record when goal record not valid', fakeAsync(async () => {
            matchDetail.halfTimeAwayScore = 0;
            matchDetail.halfTimeHomeScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = "H;"
            spyOn(verifyScoreGoalService, 'isHtGoalRecordInvalid').and.returnValue(true);

            const actual = await service.verifyFirstHalf(matchDetail);
            tick();

            expect(actual).toEqual(Language.soccer.halfTimeGoalRecordNotConsistent);
            expect(matchDetail.isWarningGoalRecord).toBeTruthy();
        }));

        it('should return message warning when score inconsistent', fakeAsync(async () => {
            matchDetail.halfTimeAwayScore = 0;
            matchDetail.halfTimeHomeScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = "H;"
            spyOn(verifyScoreGoalService, 'isHtGoalRecordInvalid').and.returnValue(false);
            matchDetail.isScoreInconsistent = true;

            const actual = await service.verifyFirstHalf(matchDetail);
            tick();

            expect(actual).toEqual(Language.soccer.confirmWithInconsistentScore);
        }));

        it('should return message warning when check new status return false', fakeAsync(async () => {
            matchDetail.halfTimeAwayScore = 0;
            matchDetail.halfTimeHomeScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = "H;"
            matchDetail.isScoreInconsistent = false;
            spyOn(verifyScoreGoalService, 'isHtGoalRecordInvalid').and.returnValue(false);
            spyOn(requestService, 'checkNewStatus').and.returnValue(of(unSuccessfulResult));

            const actual = await service.verifyFirstHalf(matchDetail);
            tick();

            expect(actual).toEqual("errorMessage");
        }));

        it('should return empty when pass all validation', fakeAsync(async () => {
            matchDetail.halfTimeAwayScore = 0;
            matchDetail.halfTimeHomeScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = "H;"
            matchDetail.isScoreInconsistent = false;
            spyOn(verifyScoreGoalService, 'isHtGoalRecordInvalid').and.returnValue(false);
            spyOn(requestService, 'checkNewStatus').and.returnValue(of(successfulResult));

            const actual = await service.verifyFirstHalf(matchDetail);
            tick();

            expect(actual).toEqual("");
        }));
    });

    describe('isScoreChangedFirstHalf', () => {
        it('should return false when ht status not equal calculated', async () => {
            matchDetail.htStatus = TicketStatusText.running;
            spyOn(requestService, 'getLastestMatchResult').and.returnValue(of(matchDetail));

            const actual = await service.isScoreChangedFirstHalf(matchDetail, false);

            expect(actual).toBeFalsy();
        });

        it('should return true when verify bet status return true', async () => {
            matchDetail.htStatus = TicketStatusText.calculated;
            spyOn(requestService, 'getLastestMatchResult').and.returnValue(of(matchDetail));
            spyOn(verifyScoreGoalService, 'isSettledFirstHalf').and.returnValue(true);

            const actual = await service.isScoreChangedFirstHalf(matchDetail, false);

            expect(actual).toBeTruthy();
        });

        it('should return true when result changed', async () => {
            matchDetail.htStatus = TicketStatusText.calculated;
            spyOn(requestService, 'getLastestMatchResult').and.returnValue(of(matchDetail));
            spyOn(verifyScoreGoalService, 'isSettledFirstHalf').and.returnValue(false);
            spyOn(verifyScoreGoalService, 'isResultChangedFirstHalf').and.returnValue(true);

            const actual = await service.isScoreChangedFirstHalf(matchDetail, false);

            expect(actual).toBeTruthy();
        });

        it('should return true when goal record ht changed', async () => {
            matchDetail.htStatus = TicketStatusText.calculated;
            spyOn(requestService, 'getLastestMatchResult').and.returnValue(of(matchDetail));
            spyOn(verifyScoreGoalService, 'isSettledFirstHalf').and.returnValue(false);
            spyOn(verifyScoreGoalService, 'isResultChangedFirstHalf').and.returnValue(false);
            spyOn(verifyScoreGoalService, 'isGoalRecordChangedFirstHalf').and.returnValue(true);

            const actual = await service.isScoreChangedFirstHalf(matchDetail, false);

            expect(actual).toBeTruthy();
        });
    });

    describe('isScoreChangedFullTime', () => {
        it('should return false when ft status not equal calculated', async () => {
            matchDetail.ftStatus = TicketStatusText.running;
            spyOn(requestService, 'getLastestMatchResult').and.returnValue(of(matchDetail));
            spyOn(verifyScoreGoalService, 'isSettledFullTime').and.returnValue(true);

            const actual = await service.isScoreChangedFullTime(matchDetail, false);

            expect(actual).toBeFalsy();
        });
        it(' should return true when verify bet status return true', async () => {
            matchDetail.ftStatus = TicketStatusText.calculated;
            spyOn(requestService, 'getLastestMatchResult').and.returnValue(of(matchDetail));
            spyOn(verifyScoreGoalService, 'isSettledFullTime').and.returnValue(true);

            const actual = await service.isScoreChangedFullTime(matchDetail, false);

            expect(actual).toBeTruthy();
        });

        it('should return true when result changed', async () => {
            matchDetail.ftStatus = TicketStatusText.calculated;
            spyOn(requestService, 'getLastestMatchResult').and.returnValue(of(matchDetail));
            spyOn(verifyScoreGoalService, 'isSettledFullTime').and.returnValue(false);
            spyOn(verifyScoreGoalService, 'isResultChangedFullTime').and.returnValue(true);

            const actual = await service.isScoreChangedFullTime(matchDetail, false);

            expect(actual).toBeTruthy();
        });

        it('should return true when goal record changed', async () => {
            matchDetail.ftStatus = TicketStatusText.calculated;
            spyOn(requestService, 'getLastestMatchResult').and.returnValue(of(matchDetail));
            spyOn(verifyScoreGoalService, 'isSettledFullTime').and.returnValue(false);
            spyOn(verifyScoreGoalService, 'isResultChangedFullTime').and.returnValue(false);
            spyOn(verifyScoreGoalService, 'isGoalRecordChangedFullTime').and.returnValue(true);

            const actual = await service.isScoreChangedFullTime(matchDetail, false);

            expect(actual).toBeTruthy();
        });
    });

    describe('isScoreChangedAll', () => {
        it('should return false when ft status not equal calculated', async () => {
            matchDetail.htStatus = TicketStatusText.running;
            matchDetail.ftStatus = TicketStatusText.running;
            spyOn(requestService, 'getLastestMatchResult').and.returnValue(of(matchDetail));
            spyOn(verifyScoreGoalService, 'isSettledAll').and.returnValue(true);

            const actual = await service.isScoreChangedAll(matchDetail, false);

            expect(actual).toBeFalsy();
        });

        it('should return false when ht status not equal calculated', async () => {
            matchDetail.htStatus = TicketStatusText.running;
            spyOn(requestService, 'getLastestMatchResult').and.returnValue(of(matchDetail));
            spyOn(verifyScoreGoalService, 'isSettledAll').and.returnValue(true);

            const actual = await service.isScoreChangedAll(matchDetail, false);

            expect(actual).toBeFalsy();
        });
        it(' should return true when verify bet status return true', async () => {
            matchDetail.ftStatus = TicketStatusText.calculated;
            matchDetail.htStatus = TicketStatusText.calculated;
            spyOn(requestService, 'getLastestMatchResult').and.returnValue(of(matchDetail));
            spyOn(verifyScoreGoalService, 'isSettledAll').and.returnValue(true);

            const actual = await service.isScoreChangedAll(matchDetail, false);

            expect(actual).toBeTruthy();
        });

        it('should return true when result HT changed', async () => {
            matchDetail.ftStatus = TicketStatusText.calculated;
            spyOn(requestService, 'getLastestMatchResult').and.returnValue(of(matchDetail));
            spyOn(verifyScoreGoalService, 'isSettledAll').and.returnValue(false);
            spyOn(verifyScoreGoalService, 'isResultChangedFirstHalf').and.returnValue(true);

            const actual = await service.isScoreChangedAll(matchDetail, false);

            expect(actual).toBeTruthy();
            matchDetail.htStatus = TicketStatusText.calculated;
        });

        it('should return true when result FT  changed', async () => {
            matchDetail.ftStatus = TicketStatusText.calculated;
            spyOn(requestService, 'getLastestMatchResult').and.returnValue(of(matchDetail));
            spyOn(verifyScoreGoalService, 'isSettledAll').and.returnValue(false);
            spyOn(verifyScoreGoalService, 'isResultChangedFirstHalf').and.returnValue(false);
            spyOn(verifyScoreGoalService, 'isResultChangedFullTime').and.returnValue(true);

            const actual = await service.isScoreChangedAll(matchDetail, false);

            expect(actual).toBeTruthy();
            matchDetail.htStatus = TicketStatusText.calculated;
        });

        it('should return true when goal record changed', async () => {
            matchDetail.ftStatus = TicketStatusText.calculated;
            matchDetail.htStatus = TicketStatusText.calculated;
            spyOn(requestService, 'getLastestMatchResult').and.returnValue(of(matchDetail));
            spyOn(verifyScoreGoalService, 'isSettledAll').and.returnValue(false);
            spyOn(verifyScoreGoalService, 'isResultChangedFirstHalf').and.returnValue(false);
            spyOn(verifyScoreGoalService, 'isResultChangedFullTime').and.returnValue(false);
            spyOn(verifyScoreGoalService, 'isGoalRecordChangedAll').and.returnValue(true);

            const actual = await service.isScoreChangedAll(matchDetail, false);

            expect(actual).toBeTruthy();
        });
    });

    describe('verifyFullTime', () => {
        it('should return message waring about input score when input score is empty', fakeAsync(async () => {
            matchDetail.finalHomeScore = 0;
            matchDetail.finalAwayScore = null;

            const actual = await service.verifyFullTime(matchDetail, []);
            tick();

            expect(actual).toEqual(Language.warningInputScore);
            expect(matchDetail.isWarningFinalHomeScore).toBeFalsy();
            expect(matchDetail.isWarningFinalAwayScore).toBeTruthy();
        }));

        it('should return message warning child match when scores is same value', fakeAsync(async () => {
            matchDetail.finalHomeScore = 2;
            matchDetail.finalAwayScore = 2;

            const actual = await service.verifyFullTime(matchDetail, [childMatch]);
            tick();

            expect(actual).toEqual(Language.soccer.childMatchesErrorMessage);
        }));

        it('should return message warning when halftime refunded and goal record include semicolon', fakeAsync(async () => {
            matchDetail.finalHomeScore = 2;
            matchDetail.finalAwayScore = 1;

            spyOn(verifyScoreGoalService, 'isRefundHalfTime').and.returnValue(true);
            const actual = await service.verifyFullTime(matchDetail, [childMatch]);
            tick();

            expect(actual).toEqual(Language.soccer.noNeedSemicolonOnGoalRecord);
        }));

        it('should return message warning goal record when missing semicolon', fakeAsync(async () => {
            matchDetail.finalHomeScore = 2;
            matchDetail.finalAwayScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = "HAA";

            spyOn(verifyScoreGoalService, 'isRefundHalfTime').and.returnValue(false);
            const actual = await service.verifyFullTime(matchDetail, [childMatch]);
            tick();

            expect(actual).toEqual(Language.soccer.needSemicolonOnGoalRecord);
            expect(matchDetail.isWarningGoalRecord).toBeTruthy();
        }));

        it('should return message warning goal record when HT goal record not valid', fakeAsync(async () => {
            matchDetail.finalHomeScore = 0;
            matchDetail.finalAwayScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = ";H";

            spyOn(verifyScoreGoalService, 'isRefundHalfTime').and.returnValue(false);
            spyOn(verifyScoreGoalService, 'isHTGoalRecordConsistent').and.returnValue(true);

            const actual = await service.verifyFullTime(matchDetail, [childMatch]);
            tick();

            expect(actual).toEqual(Language.soccer.halfTimeGoalRecordNotConsistent);
            expect(matchDetail.isWarningGoalRecord).toBeTruthy();
        }));

        it('should return message warning goal record when goal record not consistent', fakeAsync(async () => {
            matchDetail.finalHomeScore = 0;
            matchDetail.finalAwayScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = ";H";

            spyOn(verifyScoreGoalService, 'isRefundHalfTime').and.returnValue(false);
            spyOn(verifyScoreGoalService, 'isHTGoalRecordConsistent').and.returnValue(false);
            spyOn(verifyScoreGoalService, 'isFullTimeGoalRecordInvalid').and.returnValue(true);

            const actual = await service.verifyFullTime(matchDetail, [childMatch]);
            tick();

            expect(actual).toEqual(Language.soccer.goalRecordNotConsistent);
        }));

        it('should return message warning when score inconsistent', fakeAsync(async () => {
            matchDetail.halfTimeAwayScore = 0;
            matchDetail.halfTimeHomeScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = "H;"
            matchDetail.isScoreInconsistent = true;

            spyOn(verifyScoreGoalService, 'isFullTimeGoalRecordInvalid').and.returnValue(false);
            spyOn(verifyScoreGoalService, 'isRefundHalfTime').and.returnValue(false);
            spyOn(verifyScoreGoalService, 'isHTGoalRecordConsistent').and.returnValue(false);

            const actual = await service.verifyFullTime(matchDetail, [childMatch]);
            tick();

            expect(actual).toEqual(Language.soccer.incorrectHalftimeAndFullTimeScore);
        }));

        it('should return message warning when check new status return false', fakeAsync(async () => {
            matchDetail.halfTimeAwayScore = 0;
            matchDetail.halfTimeHomeScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = "H;"
            matchDetail.isScoreInconsistent = false;

            spyOn(verifyScoreGoalService, 'isFullTimeGoalRecordInvalid').and.returnValue(false);
            spyOn(verifyScoreGoalService, 'isRefundHalfTime').and.returnValue(false);
            spyOn(verifyScoreGoalService, 'isHTGoalRecordConsistent').and.returnValue(false);
            spyOn(requestService, 'checkNewStatus').and.returnValue(of(unSuccessfulResult));

            const actual = await service.verifyFullTime(matchDetail, [childMatch]);
            tick();

            expect(actual).toEqual("errorMessage");
        }));

        it('should return empty when pass all validation', fakeAsync(async () => {
            matchDetail.halfTimeAwayScore = 0;
            matchDetail.halfTimeHomeScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = "H;"
            matchDetail.isScoreInconsistent = false;

            spyOn(verifyScoreGoalService, 'isFullTimeGoalRecordInvalid').and.returnValue(false);
            spyOn(verifyScoreGoalService, 'isRefundHalfTime').and.returnValue(false);
            spyOn(verifyScoreGoalService, 'isHTGoalRecordConsistent').and.returnValue(false);
            spyOn(requestService, 'checkNewStatus').and.returnValue(of(successfulResult));

            const actual = await service.verifyFullTime(matchDetail, [childMatch]);
            tick();

            expect(actual).toEqual("");
        }));
    });

    describe('verifyAll', () => {
        it('should return message waring about input score when  HT input score is empty', fakeAsync(async () => {
            matchDetail.halfTimeHomeScore = 0;
            matchDetail.halfTimeAwayScore = null;

            const actual = await service.verifyAll(matchDetail, []);
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

            const actual = await service.verifyAll(matchDetail, []);
            tick();

            expect(actual).toEqual(Language.warningInputScore);
            expect(matchDetail.isWarningFinalHomeScore).toBeFalsy();
            expect(matchDetail.isWarningFinalAwayScore).toBeTruthy();
        }));

        it('should return message warning child match when scores is same value', fakeAsync(async () => {
            matchDetail.finalHomeScore = 2;
            matchDetail.finalAwayScore = 2;

            const actual = await service.verifyAll(matchDetail, [childMatch]);
            tick();

            expect(actual).toEqual(Language.soccer.childMatchesErrorMessage);
        }));

        it('should return message warning goal record when missing semicolon', fakeAsync(async () => {
            matchDetail.finalHomeScore = 2;
            matchDetail.finalAwayScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = "HAA";

            const actual = await service.verifyAll(matchDetail, [childMatch]);
            tick();

            expect(actual).toEqual(Language.soccer.needSemicolonOnGoalRecord);
            expect(matchDetail.isWarningGoalRecord).toBeTruthy();
        }));

        it('should return message warning goal record when HT goal record not valid', fakeAsync(async () => {
            matchDetail.finalHomeScore = 0;
            matchDetail.finalAwayScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = ";H";

            spyOn(verifyScoreGoalService, 'isHTGoalRecordConsistent').and.returnValue(true);

            const actual = await service.verifyAll(matchDetail, [childMatch]);
            tick();

            expect(actual).toEqual(Language.soccer.halfTimeGoalRecordNotConsistent);
            expect(matchDetail.isWarningGoalRecord).toBeTruthy();
        }));

        it('should return message warning goal record when goal record not consistent', fakeAsync(async () => {
            matchDetail.finalHomeScore = 0;
            matchDetail.finalAwayScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = ";H";

            spyOn(verifyScoreGoalService, 'isHTGoalRecordConsistent').and.returnValue(false);
            spyOn(verifyScoreGoalService, 'isFullTimeGoalRecordInvalid').and.returnValue(true);

            const actual = await service.verifyAll(matchDetail, [childMatch]);
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

            spyOn(verifyScoreGoalService, 'isFullTimeGoalRecordInvalid').and.returnValue(false);
            spyOn(verifyScoreGoalService, 'isHTGoalRecordConsistent').and.returnValue(false);

            const actual = await service.verifyAll(matchDetail, [childMatch]);
            tick();

            expect(actual).toEqual(Language.soccer.incorrectHalftimeAndFullTimeScore);
        }));

        it('should return message warning when check new status return false', fakeAsync(async () => {
            matchDetail.halfTimeAwayScore = 0;
            matchDetail.halfTimeHomeScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = "H;"
            matchDetail.isScoreInconsistent = false;

            spyOn(verifyScoreGoalService, 'isFullTimeGoalRecordInvalid').and.returnValue(false);
            spyOn(verifyScoreGoalService, 'isHTGoalRecordConsistent').and.returnValue(false);
            spyOn(requestService, 'checkNewStatus').and.returnValue(of(unSuccessfulResult));

            const actual = await service.verifyAll(matchDetail, [childMatch]);
            tick();

            expect(actual).toEqual("errorMessage");
        }));

        it('should return empty when pass all validation', fakeAsync(async () => {
            matchDetail.halfTimeAwayScore = 0;
            matchDetail.halfTimeHomeScore = 1;
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = "H;"
            matchDetail.isScoreInconsistent = false;

            spyOn(verifyScoreGoalService, 'isFullTimeGoalRecordInvalid').and.returnValue(false);
            spyOn(verifyScoreGoalService, 'isRefundHalfTime').and.returnValue(false);
            spyOn(verifyScoreGoalService, 'isHTGoalRecordConsistent').and.returnValue(false);
            spyOn(requestService, 'checkNewStatus').and.returnValue(of(successfulResult));

            const actual = await service.verifyAll(matchDetail, [childMatch]);
            tick();

            expect(actual).toEqual("");
        }));
    });
});

