import { ConfirmHalfTimeHandler } from './confirm-halfTime.handler';

import { VerifyActionService } from '../../../components/calc/services/verify-action.service';
import { MessageBoxService } from '../../../../shared/services';
import { Language } from '../../../../shared/language.native';
import { CalculateStorage } from '../../../storage/calculate.storage';
import { TestBed } from '@angular/core/testing';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { RequestService } from '../../../components/calc/services/request.service';
import { ModalDialogMessage } from '../../../../shared/models';
import { VerifyScoreGoalService } from '../../../components/calc/services/verify-score-goal.service';

const mockConfirm = jest.fn(
  (
    dialogModel: ModalDialogMessage,
    func: () => void,
    rejectedFunc: () => void = null
  ) => {
    func();
  }
);

describe('ConfirmHalfTimeHandler', () => {
  let handler: ConfirmHalfTimeHandler;
  let storage: CalculateStorage;
  let verifyActionService: VerifyActionService;
  let messageBoxService: MessageBoxService;

  const modalDialog = new ModalDialogMessage();

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [HttpClientModule, ToastrModule.forRoot()],
      providers: [
        ConfirmHalfTimeHandler,
        VerifyActionService,
        VerifyScoreGoalService,
        CalculateStorage,
        ToastrService,
        RequestService,
        {
          provide: MessageBoxService,
          useValue: {
            confirm: mockConfirm,
          },
        }
      ]
    });
    handler = TestBed.inject(ConfirmHalfTimeHandler);
    verifyActionService = TestBed.inject(VerifyActionService);
    messageBoxService = TestBed.inject(MessageBoxService);
    storage = TestBed.inject(CalculateStorage);

  });

  it('should confirm and set resettle ticket if score changed in first half', async () => {
    storage.getMatch = jest.fn().mockReturnValue({ matchDetail: {} });
    storage.getFullTimeResult = jest.fn().mockReturnValue({ 
      settlementStatusId: 1, 
      checked: true 
    });
    storage.getIsResettleTicket = jest.fn().mockReturnValue(false);
    verifyActionService.isScoreChangedFirstHalf = jest.fn().mockResolvedValue(true);
    storage.getConfirmMessage = jest.fn().mockReturnValue(modalDialog);

    storage.setConfirmMessage = jest.fn();
    storage.setIsResettleTicket = jest.fn();

    await handler.handle(storage);

    modalDialog.message = Language.recalculateNotification;
    expect(storage.setConfirmMessage).toHaveBeenCalledWith(Language.recalculateNotification);
    expect(messageBoxService.confirm).toHaveBeenCalledWith(modalDialog, expect.any(Function));

    expect(storage.setIsResettleTicket).toHaveBeenCalledWith(true);
  });

  it('should double check and handle if score not changed in first half', async () => {
    storage.getMatch = jest.fn().mockReturnValue({ matchDetail: {} });
    storage.getFullTimeResult = jest.fn().mockReturnValue({ 
      settlementStatusId: 1, 
      checked: true 
    });
    storage.getIsResettleTicket = jest.fn().mockReturnValue(false);
    verifyActionService.isScoreChangedFirstHalf = jest.fn().mockResolvedValue(false);
    storage.getConfirmMessage = jest.fn().mockReturnValue(modalDialog);

    storage.setConfirmMessage = jest.fn();

    await handler.handle(storage);

    modalDialog.message = Language.doubleCheckCalculateHalfTime;
    expect(storage.setConfirmMessage).toHaveBeenNthCalledWith(1, Language.doubleCheckCalculateHalfTime);
    expect(messageBoxService.confirm).toHaveBeenNthCalledWith(1, modalDialog, expect.any(Function));

    modalDialog.message = Language.checkAgainCalculateHalfTime;
    expect(storage.setConfirmMessage).toHaveBeenNthCalledWith(2, Language.checkAgainCalculateHalfTime);
    expect(messageBoxService.confirm).toHaveBeenNthCalledWith(2, modalDialog, expect.any(Function));
  });
});