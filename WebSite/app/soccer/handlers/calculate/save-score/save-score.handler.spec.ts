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
import { MatchDetail } from '../../../components/calc/models/match.model';
import { ResultDetail } from '../../../models';
import { ScoreSourceType } from '../../../../shared/constants';

describe('SaveScoreHandler', () => {
  let handler: SaveScoreHandler;
  let storage: CalculateStorage;
  let requestService: RequestService;
  let messageBoxService: MessageBoxService;

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
    messageBoxService= TestBed.inject(MessageBoxService);
  });

  it('should handle save score for non-live match successfully', async () => {
    // Arrange
    const result = { isSuccessful: true, errMsg: '' } as Result;
    const matchDetail = { 
      matchId: 123,
      applyGoalRecord: false,
      goalRecord: 'test',
      offerLive: false
    } as MatchDetail;
    
    const resultDetail1 = { 
      resourceId: 1, 
      sourceId: ScoreSourceType.trader, 
      checked: true 
    } as unknown as ResultDetail;
    
    const resultDetail2 = { 
      resourceId: 2, 
      sourceId: ScoreSourceType.screenshot, 
      checked: true 
    } as unknown as ResultDetail;
    
    const resultDetails = [resultDetail1, resultDetail2];
    
    storage.getMatch = jest.fn().mockReturnValue({ matchDetail, resultDetails });
    storage.getConfirmMessage = jest.fn().mockReturnValue({
      title: 'Title',
      message: Language.SaveTraderScore
    });
    requestService.saveScore = jest.fn().mockReturnValue(Promise.resolve(result));

    storage.setConfirmMessage = jest.fn();
    messageBoxService.confirm = jest.fn().mockImplementation((message, callback) => callback());

    // Act
    await handler.handle(storage);

    // Assert
    expect(storage.setConfirmMessage).toHaveBeenCalledWith(Language.SaveTraderScore);
    expect(messageBoxService.confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        message: Language.SaveTraderScore,
        requireCheckbox: false,
        checkboxLabel: ''
      }),
      expect.any(Function)
    );
    expect(requestService.saveScore).toHaveBeenCalledWith(
      matchDetail,
      '',
      [resultDetail1]
    );
  });

  it('should handle save score for live match successfully', async () => {
    // Arrange
    const result = { isSuccessful: true, errMsg: '' } as Result;
    const matchDetail = { 
      matchId: 123, 
      applyGoalRecord: true,
      goalRecord: 'test goal record',
      offerLive: true
    } as MatchDetail;
    
    const resultDetail1 = { 
      resourceId: 1, 
      sourceId: ScoreSourceType.trader, 
      checked: true 
    } as unknown as ResultDetail;
    
    const resultDetail2 = { 
      resourceId: 2, 
      sourceId: ScoreSourceType.screenshot, 
      checked: false 
    } as unknown as ResultDetail;
    
    const resultDetails = [resultDetail1, resultDetail2];
    
    storage.getMatch = jest.fn().mockReturnValue({ matchDetail, resultDetails });
    storage.getConfirmMessage = jest.fn().mockReturnValue({
      title: 'Title',
      message: Language.SaveTraderScoreLive
    });
    requestService.saveScore = jest.fn().mockReturnValue(Promise.resolve(result));

    storage.setConfirmMessage = jest.fn();
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
      matchDetail,
      'test goal record',
      [resultDetail1]
    );
  });

  it('should handle save score failure', async () => {
    // Arrange
    const result = { isSuccessful: false, errMsg: 'error' } as Result;
    const matchDetail = { 
      matchId: 123,
      applyGoalRecord: false,
      goalRecord: '',
      offerLive: false
    } as MatchDetail;
    
    const resultDetail = { 
      resourceId: 1, 
      sourceId: ScoreSourceType.trader, 
      checked: true 
    } as unknown as ResultDetail;
    
    const resultDetails = [resultDetail];
    
    storage.getMatch = jest.fn().mockReturnValue({ matchDetail, resultDetails });
    storage.getConfirmMessage = jest.fn().mockReturnValue({
      title: 'Title',
      message: Language.SaveTraderScore
    });
    requestService.saveScore = jest.fn().mockReturnValue(Promise.resolve(result));

    storage.error = jest.fn();
    storage.setConfirmMessage = jest.fn();
    messageBoxService.confirm = jest.fn().mockImplementation((message, callback) => callback());

    // Act
    await handler.handle(storage);

    // Assert
    expect(storage.setConfirmMessage).toHaveBeenCalledWith(Language.SaveTraderScore);
    expect(messageBoxService.confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        message: Language.SaveTraderScore,
        requireCheckbox: false,
        checkboxLabel: ''
      }),
      expect.any(Function)
    );
    expect(requestService.saveScore).toHaveBeenCalledWith(
      matchDetail,
      '',
      [resultDetail]
    );
    expect(storage.error).toHaveBeenCalledWith(result.errMsg);
  });
});