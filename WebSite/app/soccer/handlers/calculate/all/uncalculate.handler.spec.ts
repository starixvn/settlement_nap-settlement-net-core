import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MessageBoxService } from '../../../../shared/services';
import { UncalculateHandler } from './uncalculate.handler';
import { Language } from '../../../../shared/language.native';
import { CalculateAction } from '../../../../shared/constants';
import { VerifyActionService } from '../../../components/calc/services/verify-action.service';
import { VerifyScoreGoalService } from '../../../components/calc/services/verify-score-goal.service';
import { RequestService } from '../../../components/calc/services/request.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { ModalDialogMessage } from '../../../../shared/models';
import { CalculateStorage } from '../../../storage/calculate.storage';

const mockConfirm = jest.fn(
  (
    dialogModel: ModalDialogMessage,
    func: () => void,
    rejectedFunc: () => void = null
  ) => {
      func();
  }
);

describe('UncalculateHandler', () => {
  let messageBoxService: MessageBoxService;
  let storage: CalculateStorage;
  let handler: UncalculateHandler;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, ToastrModule.forRoot()],
      providers: [
        UncalculateHandler,
        VerifyActionService,
        VerifyScoreGoalService,
        RequestService,
        CalculateStorage,
        ToastrService,
        {
          provide: MessageBoxService,
          useValue: {
            confirm: mockConfirm,
          },
        }
      ]
    });

    handler = TestBed.inject(UncalculateHandler);
    messageBoxService = TestBed.inject(MessageBoxService);
    storage = TestBed.inject(CalculateStorage);
    storage.setCalculateAction = jest.fn();
    storage.setConfirmMessage = jest.fn();
  });

  it('should handle uncalculation process', fakeAsync(() => {
    const modal = new ModalDialogMessage('Confirm Message');
    storage.getConfirmMessage = jest.fn().mockReturnValue(modal);


    handler.handle(storage);

    modal.message = Language.UncalculationConfirmMessage;
    expect(storage.setConfirmMessage).toHaveBeenNthCalledWith(1, Language.UncalculationConfirmMessage);
    expect(messageBoxService.confirm).toHaveBeenNthCalledWith(1, modal, expect.any(Function));

    modal.message = Language.checkAgainUnSettleConfirmation;
    expect(storage.setConfirmMessage).toHaveBeenNthCalledWith(2, Language.checkAgainUnSettleConfirmation);
    expect(messageBoxService.confirm).toHaveBeenNthCalledWith(2, modal, expect.any(Function));
    expect(storage.setCalculateAction).toHaveBeenCalledWith(CalculateAction.unCalculate);
  }));
});