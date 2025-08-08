import { VerifySettledResultHandler } from './verify-settled-result.handler';
import { CalculateBaseStorage } from '../../../storage/storage.service.native';
import { ResultStatusId, TicketStatusText } from '../../../../shared/constants';
import { Language } from '../../../../shared/language.native';
import { AbstractHandler } from '../../abstract.handler.native';
import { Match } from '../../../components/calc/models/match.model';
import { TestBed } from '@angular/core/testing';
import { CalculateStorage } from '../../../storage/calculate.storage';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { VerifyScoreGoalService } from '../../../components/calc/services/verify-score-goal.service';
import { RequestService } from '../../../components/calc/services/request.service';

describe('VerifySettledResultHandler', () => {
  let handler: VerifySettledResultHandler;
  let storage: CalculateBaseStorage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, ToastrModule.forRoot()],
      providers: [
        VerifySettledResultHandler,
        CalculateStorage,
        ToastrService,
        VerifyScoreGoalService,
        RequestService
      ]
    });

    handler = TestBed.inject(VerifySettledResultHandler);
    storage = TestBed.inject(CalculateStorage);
    storage.getMatch = jest.fn();
    storage.error = jest.fn();
  });

  it('should call storage.error if there is a settled result', () => {
    const resultDetails = [
      { checked: true, resultStatusId: ResultStatusId.AutoCompleted, resourceName: 'Result 1' },
      { checked: false, resultStatusId: ResultStatusId.RunningOne, resourceName: 'Result 2' },
    ];
    storage.getMatch = jest.fn().mockReturnValue({ resultDetails } as Match);

    handler.handle(storage);

    expect(storage.error).toHaveBeenCalledWith(Language.saveScore.specificSettledResult.replace('{0}', 'Result 1'));
  });

  it('should call super.handle if there is no settled result', () => {
    const resultDetails = [
      { checked: true, ticketStatus: TicketStatusText.running, resourceName: 'Result 1' },
      { checked: false, ticketStatus: TicketStatusText.running, resourceName: 'Result 2' },
    ];
    storage.getMatch = jest.fn().mockReturnValue({ resultDetails } as Match);

    const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

    handler.handle(storage);

    expect(superHandleSpy).toHaveBeenCalledWith(storage);
  });
});