import { TestBed } from "@angular/core/testing";
import { VerifyScoreGoalService } from "../../../components/calc/services/verify-score-goal.service";
import { ScoreService } from "../../../components/calc/services/score.service";
import { Language } from "../../../../shared/language.native";
import { CalculateAction } from "../../../../shared/constants";
import { CalculateStorage } from "../../../storage/calculate.storage";
import { MessageBoxService } from "../../../../shared/services";
import { RequestService } from "../../../components/calc/services/request.service";
import { ToastrModule, ToastrService } from "ngx-toastr";
import { ScoreValidationHandler } from "./score-validation.handler";
import { HttpClientModule } from "@angular/common/http";

describe('ScoreValidationHandler', () => {
  let handler: ScoreValidationHandler;
  let verifyScoreGoalService: VerifyScoreGoalService;
  let scoreService: ScoreService;
  let storage: CalculateStorage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, ToastrModule.forRoot()],
      providers: [
        ScoreValidationHandler,
        MessageBoxService,
        VerifyScoreGoalService,
        RequestService,
        CalculateStorage,
        ToastrService,
        ScoreService
      ]
    });

    handler = TestBed.inject(ScoreValidationHandler);
    verifyScoreGoalService = TestBed.inject(VerifyScoreGoalService);
    scoreService = TestBed.inject(ScoreService);
    storage = TestBed.inject(CalculateStorage);
  });

  it('should call storage.error when both HT and FT scores are invalid', () => {
    storage.getMatch = jest.fn().mockReturnValue({ matchDetail: { exFTHomeScore: 0, exFTAwayScore: 0, exHTHomeScore: 0, exHTAwayScore: 0 } });
    verifyScoreGoalService.isScoresValid = jest.fn().mockReturnValue(false);

    storage.error = jest.fn();

    handler.handle(storage);

    expect(storage.error).toHaveBeenCalledWith(Language.soccer.noSBOScore);
  });

  it('should call scoreService.confirmCopyScore with final score when HT score is invalid and FT score is valid', () => {
    storage.getMatch = jest.fn().mockReturnValue({ matchDetail: { exFTHomeScore: 1, exFTAwayScore: 1, exHTHomeScore: 0, exHTAwayScore: 0 } });
    verifyScoreGoalService.isScoresValid = jest.fn().mockImplementation((home, away) => home === 1 && away === 1);

    scoreService.confirmCopyScore = jest.fn();

    handler.handle(storage);

    expect(scoreService.confirmCopyScore).toHaveBeenCalledWith(Language.soccer.confirmCopyFinalScore, CalculateAction.copyFTScore);
  });

  it('should call scoreService.confirmCopyScore with half-time score when HT score is valid and FT score is invalid', () => {
    storage.getMatch = jest.fn().mockReturnValue({ matchDetail: { exFTHomeScore: 0, exFTAwayScore: 0, exHTHomeScore: 1, exHTAwayScore: 1 } });
    verifyScoreGoalService.isScoresValid = jest.fn().mockImplementation((home, away) => home === 1 && away === 1);

    scoreService.confirmCopyScore = jest.fn();

    handler.handle(storage);

    expect(scoreService.confirmCopyScore).toHaveBeenCalledWith(Language.soccer.confirmCopyHalfTimeScore, CalculateAction.copyHTScore);
  });

  it('should call scoreService.confirmCopyScore with all scores when both HT and FT scores are valid', () => {
    storage.getMatch = jest.fn().mockReturnValue({ matchDetail: { exFTHomeScore: 1, exFTAwayScore: 1, exHTHomeScore: 1, exHTAwayScore: 1 } });
    verifyScoreGoalService.isScoresValid = jest.fn().mockReturnValue(true);

    scoreService.confirmCopyScore = jest.fn();

    handler.handle(storage);

    expect(scoreService.confirmCopyScore).toHaveBeenCalledWith(Language.soccer.confirmCopyScore, CalculateAction.copyAllScore);
  });
});