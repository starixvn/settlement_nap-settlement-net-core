import { TestBed } from '@angular/core/testing';
import { SaveScoreHandler } from './save-score.handler';
import { Language } from '../../../../shared/language.native';
import { ClosePopupService, MessageBoxService } from '../../../../shared/services';
import { RequestService } from '../../../components/calc/services/request.service';
import { Result } from '../../../../shared/models';
import { CalculateStorage } from '../../../storage/calculate.storage';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { VerifyScoreGoalService } from '../../../components/calc/services/verify-score-goal.service';
import { Match, MatchDetailSoccer } from '../../../components/calc/models/match.model';
import { ResultDetail } from '../../../models';
import { ScoreSourceType } from '../../../../shared/constants';
import { Permission } from '../../../../shared/models/sportsbook-sop/permission.model';
import { HedgeMatchDetail } from '../../../../shared/models/sportsbook-sop';

describe('SaveScoreHandler', () => {
  let handler: SaveScoreHandler;
  let storage: CalculateStorage;
  let requestService: RequestService;
  let messageBoxService: MessageBoxService;

  const matchDetail = {
    matchId: 123,
    applyGoalRecord: false,
    goalRecord: 'test',
    offerLive: false
  } as MatchDetailSoccer;

  const match: Match = {
    matchDetail,
    permission: new Permission(),
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
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, ToastrModule.forRoot()],
      providers: [
        SaveScoreHandler,
        CalculateStorage,
        RequestService,
        MessageBoxService,
        ClosePopupService,
        ToastrService,
        VerifyScoreGoalService
      ]
    });

    handler = TestBed.inject(SaveScoreHandler);
    storage = TestBed.inject(CalculateStorage);
    requestService = TestBed.inject(RequestService);
    messageBoxService = TestBed.inject(MessageBoxService);

    // Reset to default values
    matchDetail.matchId = 123;
    matchDetail.applyGoalRecord = false;
    matchDetail.goalRecord = 'test';
    matchDetail.offerLive = false;
    match.resultDetails = [];

    storage.getMatch = jest.fn().mockReturnValue(match);
    storage.setConfirmMessage = jest.fn();
    storage.getConfirmMessage = jest.fn().mockReturnValue({
      title: 'Title',
      message: Language.SaveTraderScore
    });
    storage.error = jest.fn();
  });

  it('should handle save score for non-live match successfully', async () => {
    // Arrange
    const result = { isSuccessful: true, errMsg: '' } as Result;
    
    const resultDetail1 = { 
      resourceId: 1, 
      sourceId: ScoreSourceType.trader, 
      checked: true,
      externalScores: [
        { resourceId: 1, sourceId: ScoreSourceType.trader }
      ]
    } as any;
    
    const resultDetail2 = { 
      resourceId: 2, 
      sourceId: ScoreSourceType.screenshot, 
      checked: true,
      externalScores: []
    } as any;
    
    match.resultDetails = [resultDetail1, resultDetail2];
    requestService.saveScore = jest.fn().mockReturnValue(Promise.resolve(result));
    messageBoxService.confirm = jest.fn().mockImplementation((message, callback) => callback());

    // Act
    await handler.handle(storage);

    // Assert
    expect(storage.setConfirmMessage).toHaveBeenCalledWith(Language.SaveTraderScore);
    expect(messageBoxService.confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        message: Language.SaveTraderScore,
        requireCheckbox: false,
        checkboxLabel: Language.SaveTraderScoreLiveCheckboxLabel
      }),
      expect.any(Function)
    );
    expect(requestService.saveScore).toHaveBeenCalledWith(
      match.matchDetail,
      '',
      [{ resourceId: 1, sourceId: ScoreSourceType.trader }]
    );
  });

  it('should handle save score for live match successfully', async () => {
    // Arrange
    const result = { isSuccessful: true, errMsg: '' } as Result;
    matchDetail.applyGoalRecord = true;
    matchDetail.goalRecord = 'test goal record';
    matchDetail.offerLive = true;
    
    const resultDetail1 = { 
      resourceId: 1, 
      sourceId: ScoreSourceType.trader, 
      checked: true,
      externalScores: [
        { resourceId: 1, sourceId: ScoreSourceType.trader }
      ]
    } as any;
    
    const resultDetail2 = { 
      resourceId: 2, 
      sourceId: ScoreSourceType.screenshot, 
      checked: false,
      externalScores: []
    } as any;
    
    match.resultDetails = [resultDetail1, resultDetail2];
    storage.getConfirmMessage = jest.fn().mockReturnValue({
      title: 'Title',
      message: Language.SaveTraderScoreLive
    });
    requestService.saveScore = jest.fn().mockReturnValue(Promise.resolve(result));
    messageBoxService.confirm = jest.fn().mockImplementation((message, callback) => callback());

    // Act
    await handler.handle(storage);

    // Assert
    expect(storage.setConfirmMessage).toHaveBeenCalledWith(Language.SaveTraderScoreLive);
    expect(messageBoxService.confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        message: Language.SaveTraderScoreLive,
        requireCheckbox: true,
        checkboxLabel: Language.SaveTraderScoreLiveCheckboxLabel
      }),
      expect.any(Function)
    );
    expect(requestService.saveScore).toHaveBeenCalledWith(
      match.matchDetail,
      'test goal record',
      [{ resourceId: 1, sourceId: ScoreSourceType.trader }]
    );
  });

  it('should handle save score failure', async () => {
    // Arrange
    const result = { isSuccessful: false, errMsg: 'error' } as Result;
    matchDetail.applyGoalRecord = false;
    matchDetail.goalRecord = '';
    matchDetail.offerLive = false;
    
    const resultDetail = { 
      resourceId: 1, 
      sourceId: ScoreSourceType.trader, 
      checked: true,
      externalScores: [
        { resourceId: 1, sourceId: ScoreSourceType.trader }
      ]
    } as any;
    
    match.resultDetails = [resultDetail];
    requestService.saveScore = jest.fn().mockReturnValue(Promise.resolve(result));
    messageBoxService.confirm = jest.fn().mockImplementation((message, callback) => callback());

    // Act
    await handler.handle(storage);

    // Assert
    expect(storage.setConfirmMessage).toHaveBeenCalledWith(Language.SaveTraderScore);
    expect(messageBoxService.confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        message: Language.SaveTraderScore,
        requireCheckbox: false,
        checkboxLabel: Language.SaveTraderScoreLiveCheckboxLabel
      }),
      expect.any(Function)
    );
    expect(requestService.saveScore).toHaveBeenCalledWith(
      match.matchDetail,
      '',
      [{ resourceId: 1, sourceId: ScoreSourceType.trader }]
    );
    expect(storage.error).toHaveBeenCalledWith(result.errMsg);
  });
});