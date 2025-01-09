import { VerifySettledResultHandler } from './verify-settled-result.handler';
import { Storage } from '../../../storage/storage.service.native';
import { TicketStatusText } from '../../../../shared/constants';
import { Language } from '../../../../shared/language.native';
import { AbstractHandler } from '../../abstract.handler.native';
import { Match } from '../../../components/calc/models/match.model';

describe('VerifySettledResultHandler', () => {
  let handler: VerifySettledResultHandler;
  let storageMock: jest.Mocked<Storage>;

  beforeEach(() => {
    handler = new VerifySettledResultHandler();
    storageMock = {
      getMatch: jest.fn(),
      error: jest.fn(),
    } as unknown as jest.Mocked<Storage>;
  });

  it('should call storage.error if there is a settled result', () => {
    const resultDetails = [
      { checked: true, ticketStatus: TicketStatusText.calculated, resourceName: 'Result 1' },
      { checked: false, ticketStatus: TicketStatusText.running, resourceName: 'Result 2' },
    ];
    storageMock.getMatch.mockReturnValue({ resultDetails } as Match);

    handler.handle(storageMock);

    expect(storageMock.error).toHaveBeenCalledWith(Language.saveScore.specificSettledResult.replace('{0}', 'Result 1'));
  });

  it('should call super.handle if there is no settled result', () => {
    const resultDetails = [
      { checked: true, ticketStatus: TicketStatusText.running, resourceName: 'Result 1' },
      { checked: false, ticketStatus: TicketStatusText.running, resourceName: 'Result 2' },
    ];
    storageMock.getMatch.mockReturnValue({ resultDetails } as Match);

    const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

    handler.handle(storageMock);

    expect(superHandleSpy).toHaveBeenCalledWith(storageMock);
  });
});