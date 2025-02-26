import { CheckBetStatusHandler } from './check-betstatus.handler';
import { Storage } from '../../../storage/storage.service.native';
import { BetStatus, ResourceIds } from '../../../constants';
import { SettlementStatusId } from '../../../../shared/constants';
import { Language } from '../../../../shared/language.native';
import { AbstractHandler } from '../../abstract.handler.native';

describe('CheckBetStatusHandler', () => {
  let handler: CheckBetStatusHandler;
  let storage: Storage;

  beforeEach(() => {
    handler = new CheckBetStatusHandler();
    storage = {
      getMatch: jest.fn(),
      error: jest.fn()
    } as unknown as Storage;
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