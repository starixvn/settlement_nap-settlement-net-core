import { TestBed } from '@angular/core/testing';
import { VerifyAllHandler } from './verify-all.handler';
import { VerifyScoreGoalService } from '../../../components/calc/services/verify-score-goal.service';
import { VerifyActionService } from '../../../components/calc/services/verify-action.service';
import { MatchDetail, ChildMatch, FantasyRelatedMatch, Match } from '../../../components/calc/models/match.model';
import { Language } from '../../../../shared/language.native';
import { CalculateStorage } from '../../../storage/calculate.storage';
import { RequestService } from '../../../components/calc/services/request.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { Permission } from '../../../../shared/models/sportsbook-sop/permission.model';
import { AbstractHandler } from '../../abstract.handler.native';
import { HttpClientModule } from '@angular/common/http';

describe('VerifyAllHandler', () => {
  let handler: VerifyAllHandler;
  let verifyScoreGoalService: VerifyScoreGoalService;
  let verifyActionService: VerifyActionService;
  let storage: CalculateStorage;

  const matchDetail = {
    isScoreInconsistent : false
  } as MatchDetail;

  const match: Match ={
    matchDetail,
    permission: new Permission,
    ticketCounts: [],
    resultDetails: [],
    hedgeMatchDetail: undefined,
    fantasyMatch: undefined,
    childMatches: []
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, ToastrModule.forRoot()],
      providers: [
        VerifyAllHandler,
        VerifyActionService,
        VerifyScoreGoalService,
        RequestService,
        CalculateStorage,
        ToastrService,
      ]
    });

    handler = TestBed.inject(VerifyAllHandler);
    verifyScoreGoalService = TestBed.inject(VerifyScoreGoalService);
    verifyActionService = TestBed.inject(VerifyActionService);
    storage = TestBed.inject(CalculateStorage) ;
    match.matchDetail.isScoreInconsistent = false;
    match.matchDetail.isFantasyMatch = false;
  });

  it('should handle verification errors correctly', async () => {
    storage.getMatch = jest.fn().mockReturnValue(match);
    storage.error = jest.fn();

    verifyScoreGoalService.verifyScoreAll= jest.fn().mockReturnValue(true);

    await handler.handle(storage);

    expect(storage.error).toHaveBeenCalledWith(Language.warningInputScore);
  });

  it('should handle child match verification errors correctly', async () => {
    storage.error = jest.fn();
    storage.getMatch = jest.fn().mockReturnValue(match);

    verifyScoreGoalService.verifyScoreAll = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.verifyScoreForChildMatch = jest.fn().mockReturnValue(true);

    await handler.handle(storage);

    expect(storage.error).toHaveBeenCalledWith(Language.soccer.childMatchesErrorMessage);
  });

  it('should handle goal record semicolon errors correctly', async () => {
    storage.error = jest.fn();
    storage.getMatch = jest.fn().mockReturnValue(match);

    verifyScoreGoalService.verifyScoreAll = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.verifyScoreForChildMatch = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.goalRecordNotExistSemicolon = jest.fn().mockReturnValue(true);

    await handler.handle(storage);

    expect(storage.error).toHaveBeenCalledWith(Language.soccer.needSemicolonOnGoalRecord);
  });

  it('should handle half-time goal record consistency errors correctly', async () => {
    storage.getMatch = jest.fn().mockReturnValue(match);
    storage.error = jest.fn();

    verifyScoreGoalService.verifyScoreAll = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.verifyScoreForChildMatch = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.goalRecordNotExistSemicolon = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.isHTGoalRecordConsistent = jest.fn().mockReturnValue(true);

    await handler.handle(storage);

    expect(storage.error).toHaveBeenCalledWith(Language.soccer.halfTimeGoalRecordNotConsistent);
  });

  it('should handle full-time goal record invalid errors correctly', async () => {
    storage.getMatch = jest.fn().mockReturnValue(match);
    storage.error = jest.fn();

    verifyScoreGoalService.verifyScoreAll = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.verifyScoreForChildMatch = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.goalRecordNotExistSemicolon = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.isHTGoalRecordConsistent = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.isFullTimeGoalRecordInvalid = jest.fn().mockReturnValue(true);

    await handler.handle(storage);

    expect(storage.error).toHaveBeenCalledWith(Language.soccer.goalRecordNotConsistent);
  });

  it('should handle score inconsistency errors correctly', async () => {
    match.matchDetail.isScoreInconsistent = true
    storage.getMatch = jest.fn().mockReturnValue(match);
    storage.error = jest.fn();

    verifyScoreGoalService.verifyScoreAll = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.verifyScoreForChildMatch = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.goalRecordNotExistSemicolon = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.isHTGoalRecordConsistent = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.isFullTimeGoalRecordInvalid = jest.fn().mockReturnValue(false);


    await handler.handle(storage);

    expect(storage.error).toHaveBeenCalledWith(Language.soccer.incorrectHalftimeAndFullTimeScore);
  });

  it('should handle fantasy match related matches not calculated errors correctly', async () => {
    match.matchDetail.isFantasyMatch = true
    storage.getMatch = jest.fn().mockReturnValue(match);
    storage.error = jest.fn();

    verifyScoreGoalService.verifyScoreAll = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.verifyScoreForChildMatch = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.goalRecordNotExistSemicolon = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.isHTGoalRecordConsistent = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.isFullTimeGoalRecordInvalid = jest.fn().mockReturnValue(false);
    verifyActionService.isAllResultRelatedMatchesNotCalc = jest.fn().mockReturnValue(true);

    await handler.handle(storage);

    expect(storage.error).toHaveBeenCalledWith(Language.fantasyMatch.relatedMatchesNotCalc);
  });

  it('should handle new status check errors correctly', async () => {
    storage.getMatch = jest.fn().mockReturnValue(match);
    storage.error = jest.fn();

    verifyScoreGoalService.verifyScoreAll = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.verifyScoreForChildMatch = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.goalRecordNotExistSemicolon = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.isHTGoalRecordConsistent = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.isFullTimeGoalRecordInvalid = jest.fn().mockReturnValue(false);
    verifyActionService.isAllResultRelatedMatchesNotCalc = jest.fn().mockReturnValue(false);
    verifyActionService.checkNewStatus = jest.fn().mockReturnValue("mock error");

    await handler.handle(storage);

    expect(storage.error).toHaveBeenCalledWith("mock error");
  });

  it('should call super.handle if no errors', async () => {
    storage.getMatch = jest.fn().mockReturnValue(match);

    verifyScoreGoalService.verifyScoreAll = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.verifyScoreForChildMatch = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.goalRecordNotExistSemicolon = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.isHTGoalRecordConsistent = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.isFullTimeGoalRecordInvalid = jest.fn().mockReturnValue(false);
    verifyActionService.isAllResultRelatedMatchesNotCalc = jest.fn().mockReturnValue(false);
    verifyActionService.checkNewStatus = jest.fn().mockReturnValue(null);

    AbstractHandler.prototype.handle = jest.fn();

    await handler.handle(storage);

    expect(AbstractHandler.prototype.handle).toHaveBeenCalledWith(storage);
  });
});