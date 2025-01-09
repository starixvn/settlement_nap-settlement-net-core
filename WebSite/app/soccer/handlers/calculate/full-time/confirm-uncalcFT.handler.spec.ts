import { ConfirmUncalcFTHandler } from './confirm-uncalcFT.handler';
import { AbstractHandler } from '../../abstract.handler.native';
import { Storage } from '../../../storage/storage.service.native';
import { Language } from '../../../../shared/language.native';
import { MessageBoxService } from '../../../../shared/services';
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { VerifyScoreGoalService } from '../../../components/calc/services/verify-score-goal.service';
import { CalculateStorage } from '../../../storage/calculate.storage';
import { RequestService } from '../../../components/calc/services/request.service';
import { ModalDialogMessage } from '../../../../shared/models';

describe('ConfirmUncalcFTHandler', () => {
  let handler: ConfirmUncalcFTHandler;
  let storage: Storage;
  let messageBoxService: MessageBoxService;
  const message = new ModalDialogMessage();

  beforeEach(() => {
    TestBed.configureTestingModule({
          imports: [HttpClientModule, ToastrModule.forRoot()],
          providers: [
            ConfirmUncalcFTHandler,
            VerifyScoreGoalService,
            CalculateStorage,
            ToastrService,
            RequestService,
            MessageBoxService
          ]
        });
    handler = TestBed.inject(ConfirmUncalcFTHandler);
    storage = TestBed.inject(CalculateStorage);
    messageBoxService = TestBed.inject(MessageBoxService);
		storage.setConfirmMessage = jest.fn();
    storage.getConfirmMessage = jest.fn().mockReturnValue(message);
  });

  it('should set confirm message and call messageBoxService.confirm twice', () => {
    const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');
    
    messageBoxService.confirm = jest.fn().mockImplementation((message: ModalDialogMessage, callback) => callback());

    handler.handle(storage);

    message.message = Language.UncalculateFTConfirmMessage;
    expect(storage.setConfirmMessage).toHaveBeenNthCalledWith(1,Language.UncalculateFTConfirmMessage);
    expect(messageBoxService.confirm).toHaveBeenNthCalledWith(1, message, expect.any(Function));

    message.message = Language.checkAgainUncalculateFTConfirmation;
    expect(storage.setConfirmMessage).toHaveBeenNthCalledWith(2,Language.checkAgainUncalculateFTConfirmation);
    expect(messageBoxService.confirm).toHaveBeenNthCalledWith(2,message, expect.any(Function));
    expect(superHandleSpy).toHaveBeenCalledWith(storage);
  });
});