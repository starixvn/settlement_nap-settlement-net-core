import { TestBed } from '@angular/core/testing';
import { SaveScoreHandler } from './save-score.handler';
import { Storage } from '../../../storage/storage.service.native';
import { Language } from '../../../../shared/language.native';
import { ClosePopupService, MessageBoxService } from '../../../../shared/services';
import { RequestService } from '../../../components/calc/services/request.service';
import { Result } from '../../../../shared/models';
import { CalculateStorage } from '../../../storage/calculate.storage';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { VerifyScoreGoalService } from '../../../components/calc/services/verify-score-goal.service';
import { MatchDetail } from '../../../components/calc/models/match.model';

describe('SaveScoreHandler', () => {
  let handler: SaveScoreHandler;
  let storage: CalculateStorage;
  let requestService: RequestService;
  let messageBoxService: MessageBoxService;
  let closePopupService: ClosePopupService;

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
    closePopupService = TestBed.inject(ClosePopupService);
  });

  it('should handle save score successfully', async () => {
    const result = { isSuccessful: true, errMsg: '' } as Result;
    const matchDetail = { } as MatchDetail;
    storage.getMatch = jest.fn().mockReturnValue({matchDetail });
    storage.getConfirmMessage = jest.fn().mockReturnValue(Language.SaveTraderScore);
    requestService.saveScore = jest.fn().mockReturnValue(Promise.resolve(result));

    storage.setConfirmMessage = jest.fn();
    closePopupService.closePopup = jest.fn();
    messageBoxService.confirm = jest.fn().mockImplementation((message, callback) => callback());

    await handler.handle(storage);

    expect(storage.setConfirmMessage).toHaveBeenCalledWith(Language.SaveTraderScore);
    expect(messageBoxService.confirm).toHaveBeenCalledWith(Language.SaveTraderScore, expect.any(Function));
    expect(requestService.saveScore).toHaveBeenCalledWith(matchDetail);
    expect(closePopupService.closePopup).toHaveBeenCalled();
  });

  it('should handle save score failure', async () => {
    const result = { isSuccessful: false, errMsg: 'error' } as Result;
    const matchDetail = { } as MatchDetail;
    storage.getMatch = jest.fn().mockReturnValue({ matchDetail });
    storage.getConfirmMessage = jest.fn().mockReturnValue(Language.SaveTraderScore);
    requestService.saveScore = jest.fn().mockReturnValue(Promise.resolve(result));

    storage.error = jest.fn();
    storage.setConfirmMessage = jest.fn();
    messageBoxService.confirm = jest.fn().mockImplementation((message, callback) => callback());

    await handler.handle(storage);

    expect(storage.setConfirmMessage).toHaveBeenCalledWith(Language.SaveTraderScore);
    expect(messageBoxService.confirm).toHaveBeenCalledWith(Language.SaveTraderScore, expect.any(Function));
    expect(requestService.saveScore).toHaveBeenCalledWith(matchDetail);
    expect(storage.error).toHaveBeenCalledWith(result.errMsg);
  });
});