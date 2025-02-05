import { VerifyFulltimeHandler } from "./verify-fulltime.handler";
import { VerifyScoreGoalService } from "../../../components/calc/services/verify-score-goal.service";
import { VerifyActionService } from "../../../components/calc/services/verify-action.service";
import { Storage } from "../../../storage/storage.service.native";
import { MatchDetail, ChildMatch, FantasyRelatedMatch, Match } from "../../../components/calc/models/match.model";
import { Language } from "../../../../shared/language.native";
import { CalculateAction } from "../../../../shared/constants";
import { TestBed } from "@angular/core/testing";
import { CalculateStorage } from "../../../storage/calculate.storage";
import { HttpClientModule } from "@angular/common/http";
import { ToastrModule, ToastrService } from "ngx-toastr";
import { RequestService } from "../../../components/calc/services/request.service";
import { ClosePopupService, MessageBoxService } from "../../../../shared/services";
import { Permission } from "../../../../shared/models/sportsbook-sop/permission.model";
import { AbstractHandler } from "../../abstract.handler.native";
import { ResultDetail } from "../../../models";

describe("VerifyFulltimeHandler", () => {
  let handler: VerifyFulltimeHandler;
  let verifyScoreGoalService: VerifyScoreGoalService;
  let verifyActionService: VerifyActionService;
  let storage: CalculateStorage;

  const matchDetail = {
    isScoreInconsistent: false
  } as MatchDetail;
  const match: Match = {
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
        VerifyFulltimeHandler,
        VerifyScoreGoalService,
        VerifyActionService,
        CalculateStorage,
        ToastrService,
        RequestService,
        MessageBoxService,
        ClosePopupService
      ]
    });

    handler = TestBed.inject(VerifyFulltimeHandler);
    verifyScoreGoalService = TestBed.inject(VerifyScoreGoalService);
    verifyActionService = TestBed.inject(VerifyActionService);
    storage = TestBed.inject(CalculateStorage);
    storage.error = jest.fn();
    matchDetail.isScoreInconsistent = false;
    storage.getMatch = jest.fn().mockReturnValue(match);
    storage.getFullTimeResult= jest.fn().mockReturnValue(new ResultDetail()),

    verifyScoreGoalService.verifyScore = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.verifyScoreForChildMatch = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.goalRecordExistSemicolon = jest.fn().mockReturnValue(false);

    verifyScoreGoalService.isRefundHalfTime = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.goalRecordNotExistSemicolon = jest.fn().mockReturnValue(false)
    verifyScoreGoalService.isHTGoalRecordConsistent = jest.fn().mockReturnValue(false);
    verifyScoreGoalService.isFullTimeGoalRecordInvalidWithResultDetail = jest.fn().mockReturnValue(false);
    verifyActionService.isFullTimeRelatedMatchesNotCalc = jest.fn().mockReturnValue(false);
  });

  it("should return warningInputScore if verifyScoreFullTime returns true", async () => {
    verifyScoreGoalService.verifyScore = jest.fn().mockReturnValue(true);

    await handler.handle(storage);

    expect(storage.error).toHaveBeenCalledWith(Language.warningInputScore);
  });

  it("should return childMatchesErrorMessage if verifyScoreForChildMatch returns true", async () => {
    verifyScoreGoalService.verifyScoreForChildMatch = jest.fn().mockReturnValue(true);

    await handler.handle(storage);

    expect(storage.error).toHaveBeenCalledWith(Language.soccer.childMatchesErrorMessage);
  });

  it("should return noNeedSemicolonOnGoalRecord if isRefundHalfTimeAndHasSemicolon returns true", async () => {
    verifyScoreGoalService.isRefundHalfTime = jest.fn().mockReturnValue(true);

    verifyScoreGoalService.goalRecordExistSemicolon = jest.fn().mockReturnValue(true)

    await handler.handle(storage);

    expect(storage.error).toHaveBeenCalledWith(Language.soccer.noNeedSemicolonOnGoalRecord);
  });

  it("should return needSemicolonOnGoalRecord if isNotRefundHalfTimeAndHasNotSemicolon returns true", async () => {
    verifyScoreGoalService.goalRecordNotExistSemicolon = jest.fn().mockReturnValue(true)

    await handler.handle(storage);

    expect(storage.error).toHaveBeenCalledWith(Language.soccer.needSemicolonOnGoalRecord);
  });

  it("should return halfTimeGoalRecordNotConsistent if isHTGoalRecordConsistent returns true", async () => {
    verifyScoreGoalService.isHTGoalRecordConsistent = jest.fn().mockReturnValue(true);

    await handler.handle(storage);

    expect(storage.error).toHaveBeenCalledWith(Language.soccer.halfTimeGoalRecordNotConsistent);
  });

  it("should return goalRecordNotConsistent if isFullTimeGoalRecordInvalid returns true", async () => {
    verifyScoreGoalService.isFullTimeGoalRecordInvalidWithResultDetail = jest.fn().mockReturnValue(true);

    await handler.handle(storage);

    expect(storage.error).toHaveBeenCalledWith(Language.soccer.goalRecordNotConsistent);
  });

  it("should return incorrectHalftimeAndFullTimeScore if isScoreInconsistent is true", async () => {
    matchDetail.isScoreInconsistent = true;
    storage.getMatch = jest.fn().mockReturnValue(match);

    await handler.handle(storage);

    expect(storage.error).toHaveBeenCalledWith(Language.soccer.incorrectHalftimeAndFullTimeScore);
  });

  it("should return relatedMatchesNotCalc if isFantasyMatchAndRelatedMatches returns true", async () => {
    matchDetail.isFantasyMatch = true;
    storage.getMatch = jest.fn().mockReturnValue(match);
    verifyActionService.isFullTimeRelatedMatchesNotCalc = jest.fn().mockReturnValue(true);

    await handler.handle(storage);

    expect(storage.error).toHaveBeenCalledWith(Language.fantasyMatch.relatedMatchesNotCalc);
  });

  it("should call checkNewStatus if no errors are found", async () => {
    verifyActionService.checkNewStatus = jest.fn().mockReturnValue('mock error');

    await handler.handle(storage);

    expect(storage.error).toHaveBeenCalledWith('mock error');
  });

  it("should call next handler if all verify passed", async () => {
    verifyActionService.checkNewStatus = jest.fn().mockReturnValue('');
    AbstractHandler.prototype.handle = jest.fn();

    await handler.handle(storage);

    expect(AbstractHandler.prototype.handle).toHaveBeenCalled();
  });
});