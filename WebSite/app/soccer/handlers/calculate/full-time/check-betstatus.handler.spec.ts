import { CheckBetStatusHandler } from './check-betstatus.handler';
import { CalculateBaseStorage } from '../../../storage/storage.service.native';
import { BetStatus, ResourceIds } from '../../../constants';
import { SettlementStatusId } from '../../../../shared/constants';
import { Language } from '../../../../shared/language.native';
import { AbstractHandler } from '../../abstract.handler.native';
import { TestBed } from '@angular/core/testing';
import { CalculateStorage } from '../../../storage/calculate.storage';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { VerifyScoreGoalService } from '../../../components/calc/services/verify-score-goal.service';
import { RequestService } from '../../../components/calc/services/request.service';

describe('CheckBetStatusHandler', () => {
  let handler: CheckBetStatusHandler;
  let storage: CalculateBaseStorage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, ToastrModule.forRoot()],
      providers: [
        CheckBetStatusHandler,
        CalculateStorage,
        ToastrService,
        VerifyScoreGoalService,
        RequestService
      ]
    });

    handler = TestBed.inject(CheckBetStatusHandler);
    storage = TestBed.inject(CalculateStorage);
    storage.getMatch = jest.fn();
    storage.error = jest.fn();
  });

  it('should call storage.error when betStatus is abandoned1H', () => {
    const matchDetail = { betStatus: BetStatus.abandoned1H };
    const resultDetails = [];
    storage.getMatch = jest.fn().mockReturnValue({ matchDetail, resultDetails });

    handler.handle(storage);

    expect(storage.error).toHaveBeenCalledWith(Language.CannotUncalculateFTMessage);
  });

  it('should call storage.error when betStatus is refunded and settlementStatusId is Refund', () => {
    const matchDetail = { betStatus: `${BetStatus.refunded};` };
    const resultDetails = [{ resourceId: ResourceIds.halfTime, settlementStatusId: SettlementStatusId.Refund }];
    storage.getMatch = jest.fn().mockReturnValue({ matchDetail, resultDetails });
    storage.getHalfTimeResult = jest.fn().mockReturnValue({ settlementStatusId: SettlementStatusId.Refund });
    handler.handle(storage);

    expect(storage.error).toHaveBeenCalledWith(Language.CannotUncalculateFTMessage);
  });

  it('should call super.handle when conditions are not met', () => {
    const matchDetail = { betStatus: 'active' };
    const resultDetails = [{ resourceId: ResourceIds.halfTime, settlementStatusId: SettlementStatusId.Calculated }];
    storage.getMatch = jest.fn().mockReturnValue({ matchDetail, resultDetails });

    const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

    handler.handle(storage);

    expect(superHandleSpy).toHaveBeenCalledWith(storage);
  });
});