import { TestBed } from '@angular/core/testing';
import { MessageBoxService } from '../../../../shared/services';
import { RequestService } from '../../../components/calc/services/request.service';
import { ClosePopupService } from '../../../../shared/services';
import { Storage } from '../../../storage/storage.service.native';
import { InstantCalculationQuery } from '../../../components/calc/models/query.model';
import { CalculateStorage } from '../../../storage/calculate.storage';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { VerifyScoreGoalService } from '../../../components/calc/services/verify-score-goal.service';
import { PushInstantScoreHandler } from './push-instant-score.handler';


describe('PushInstantScore', () => {
  let handler: PushInstantScoreHandler;
  let messageBoxService: MessageBoxService;
  let requestService: RequestService;
  let closePopupService: ClosePopupService;
  let storage: CalculateStorage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, ToastrModule.forRoot()],
      providers: [
        PushInstantScoreHandler,
        MessageBoxService,
        RequestService,
        ClosePopupService,
        ToastrService,
        VerifyScoreGoalService,
        CalculateStorage
      ]
    })

    handler = TestBed.inject(PushInstantScoreHandler);
    messageBoxService = TestBed.inject(MessageBoxService);
    requestService = TestBed.inject(RequestService);
    closePopupService = TestBed.inject(ClosePopupService);
    storage = TestBed.inject(CalculateStorage);
  });

  it('should set confirm message and call confirm method', async () => {
    const scoreResult = { homeScore: 2, awayScore: 1, isHt: true, goalRecord: 'goal' };
    const matchDetail = { matchId: 123 };
    const confirmMessage = 'Confirm message';

    storage.getInstantScore = jest.fn().mockReturnValue(scoreResult);
    storage.getMatch = jest.fn().mockReturnValue({ matchDetail });
    storage.setConfirmMessage = jest.fn();
    storage.getConfirmMessage = jest.fn().mockReturnValue(confirmMessage);
    closePopupService.closePopup = jest.fn();

    messageBoxService.confirm = jest.fn((message, callback) => callback());

    requestService.pushInstantScore = jest.fn().mockResolvedValue({ isSuccessful: true });

    await handler.handle(storage);

    expect(storage.setConfirmMessage).toHaveBeenCalledWith(expect.stringContaining('2-1'));
    expect(messageBoxService.confirm).toHaveBeenCalledWith(confirmMessage, expect.any(Function));
    expect(requestService.pushInstantScore).toHaveBeenCalledWith(expect.any(InstantCalculationQuery));
    expect(closePopupService.closePopup).toHaveBeenCalled();
  });

  it('should handle error when pushInstantScore fails', async () => {
    const scoreResult = { homeScore: 2, awayScore: 1, isHt: true, goalRecord: 'goal' };
    const matchDetail = { matchId: 123 };
    const confirmMessage = 'Confirm message';
    const errorMessage = 'Error message';

    storage.getInstantScore = jest.fn().mockReturnValue(scoreResult);
    storage.getMatch = jest.fn().mockReturnValue({ matchDetail });
    storage.setConfirmMessage = jest.fn();
    storage.getConfirmMessage = jest.fn().mockReturnValue(confirmMessage);
    storage.error = jest.fn();

    messageBoxService.confirm = jest.fn((message, callback) => callback());

    requestService.pushInstantScore = jest.fn().mockResolvedValue({ isSuccessful: false, errMsg: errorMessage });

    await handler.handle(storage);

    expect(storage.setConfirmMessage).toHaveBeenCalledWith(expect.stringContaining('2-1'));
    expect(messageBoxService.confirm).toHaveBeenCalledWith(confirmMessage, expect.any(Function));
    expect(requestService.pushInstantScore).toHaveBeenCalledWith(expect.any(InstantCalculationQuery));
    expect(storage.error).toHaveBeenCalledWith(errorMessage);
  });
});