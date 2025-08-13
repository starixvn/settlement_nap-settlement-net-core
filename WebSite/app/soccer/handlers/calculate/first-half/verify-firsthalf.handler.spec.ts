import { TestBed } from '@angular/core/testing';
import { VerifyFirstHalfHandler } from './verify-firsthalf.handler';
import { VerifyScoreGoalService } from '../../../components/calc/services/verify-score-goal.service';
import { VerifyActionService } from '../../../components/calc/services/verify-action.service';
import { MatchDetailSoccer, Match } from '../../../components/calc/models/match.model';
import { Language } from '../../../../shared/language.native';
import { CalculateAction } from '../../../../shared/constants';
import { Permission } from '../../../../shared/models/sportsbook-sop/permission.model';
import { CalculateStorage } from '../../../storage/calculate.storage';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { RequestService } from '../../../components/calc/services/request.service';
import { ResultDetail } from '../../../models';
import { HedgeMatchDetail } from '../../../../shared/models/sportsbook-sop';

describe('VerifyFirstHalfHandler', () => {
  let handler: VerifyFirstHalfHandler;
  let verifyScoreGoalService: VerifyScoreGoalService;
  let verifyActionService: VerifyActionService;
  let storage: CalculateStorage;

  const matchDetail = {
    isScoreInconsistent: false
  } as MatchDetailSoccer;
  const match: Match = {
    matchDetail,
    permission: new Permission,
    ticketCounts: [],
    resultDetails: [],
    hedgeMatchDetail: undefined,
    fantasyMatch: undefined,
    childMatches: [],
    externalResults: [],
    originalResultDetail: [],
    oldMatchDetail: new HedgeMatchDetail,
    isClickOnCalculate: false,
    isScoreDirect: false
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, ToastrModule.forRoot()],
      providers: [
        VerifyFirstHalfHandler,
        VerifyScoreGoalService,
        VerifyActionService,
        CalculateStorage,
        ToastrService,
        RequestService
      ]
    });

    handler = TestBed.inject(VerifyFirstHalfHandler);
    verifyScoreGoalService = TestBed.inject(VerifyScoreGoalService);
    verifyActionService = TestBed.inject(VerifyActionService);
    storage = TestBed.inject(CalculateStorage);
    matchDetail.isScoreInconsistent = false;
    matchDetail.applyGoalRecord = false;
    matchDetail.isFantasyMatch = false;
    storage.getMatch = jest.fn().mockReturnValue(match);
    storage.getRelatedMatches = jest.fn().mockReturnValue([]);
    storage.getHalfTimeResult= jest.fn().mockReturnValue(new ResultDetail()),
    storage.error = jest.fn();
  });


  it('should return warningInputScore if verifyScore is true', async () => {
    verifyScoreGoalService.verifyScore = jest.fn().mockReturnValue(true);

    await handler.handle(storage);

    expect(storage.error).toHaveBeenCalledWith(Language.warningInputScore);
  });

  it('should return needSemicolonOnGoalRecord if goalRecordNotExistSemicolon is true', async () => {
    verifyScoreGoalService.verifyScore = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.goalRecordNotExistSemicolon = jest.fn().mockReturnValue(true);

    await handler.handle(storage);

    expect(storage.error).toHaveBeenCalledWith(Language.soccer.needSemicolonOnGoalRecord);
    expect(matchDetail.isWarningGoalRecord).toBe(true);
  });

  it('should return halfTimeGoalRecordNotConsistent if isHtGoalRecordInvalid is true', async () => {
    matchDetail.applyGoalRecord = true;
    verifyScoreGoalService.verifyScore = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.goalRecordNotExistSemicolon = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.isHtGoalRecordInvalidWithResultDetail = jest.fn().mockReturnValue(true);

    await handler.handle(storage);

    expect(storage.error).toHaveBeenCalledWith(Language.soccer.halfTimeGoalRecordNotConsistent);
  });

  it('should return confirmWithInconsistentScore if isScoreInconsistent is true', async () => {
    matchDetail.isScoreInconsistent = true;
    verifyScoreGoalService.isHtGoalRecordInvalidWithResultDetail = jest.fn().mockReturnValue(true);
    verifyScoreGoalService.verifyScore = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.goalRecordNotExistSemicolon = jest.fn().mockReturnValue(false);

    await handler.handle(storage);

    expect(storage.error).toHaveBeenCalledWith(Language.soccer.incorrectHalftimeAndFullTimeScore);
  });

  it('should return relatedMatchesNotCalc if isFirstHalfRelatedMatchesNotCalc is true', async () => {
    matchDetail.isFantasyMatch = true;
    verifyScoreGoalService.verifyScore = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.goalRecordNotExistSemicolon = jest.fn().mockReturnValue(false);
    verifyActionService.isFirstHalfRelatedMatchesNotCalc = jest.fn().mockReturnValue(true);

    await handler.handle(storage);

    expect(storage.error).toHaveBeenCalledWith(Language.fantasyMatch.relatedMatchesNotCalc);
  });

  it('should call checkNewStatus if no conditions are met', async () => {
    verifyScoreGoalService.verifyScore = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.goalRecordNotExistSemicolon = jest.fn().mockReturnValue(false);
    verifyActionService.checkNewStatus = jest.fn().mockReturnValue(null);

    await handler.handle(storage);

    expect(verifyActionService.checkNewStatus).toHaveBeenCalledWith(matchDetail, CalculateAction.calculateHalfTime);
  });

  it('should return the result of checkNewStatus if no other conditions are met', async () => {
    const expectedResult = 'new status';
    verifyScoreGoalService.verifyScore = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.goalRecordNotExistSemicolon = jest.fn().mockReturnValue(false);
    verifyActionService.checkNewStatus = jest.fn().mockReturnValue(expectedResult);

    await handler.handle(storage);

    expect(storage.error).toHaveBeenCalledWith(expectedResult);
  });
});