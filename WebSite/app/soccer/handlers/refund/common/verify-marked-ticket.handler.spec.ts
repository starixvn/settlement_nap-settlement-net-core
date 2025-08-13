import { TestBed } from '@angular/core/testing';
import { VerifyMarkedTicketHandler } from './verify-marked-ticket.handler';
import { RefundStorage } from '../../../storage/refund.storage';
import { RefundBaseStorage } from '../../../storage/storage.service.native';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { Language } from '../../../../shared/language.native';
import { RequestService } from '../../../components/sop-refund/services/request.service';

describe('VerifyMarkedTicketHandler', () => {
  let handler: VerifyMarkedTicketHandler;
  let storage: RefundBaseStorage;
  let requestServiceMock: { checkingMarkedTicket: jest.Mock };
  let nextHandler: { handle: jest.Mock };

  const match = {
    matchDetail: { matchId: 123 }
  } as any;

  const selectedResources = [
    { resourceId: '00', checked: true },
    { resourceId: '01', checked: true }
  ] as any[];

  beforeEach(() => {
    jest.clearAllMocks();

    requestServiceMock = {
      checkingMarkedTicket: jest.fn()
    };

    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot()],
      providers: [
        VerifyMarkedTicketHandler,
        RefundStorage,
        ToastrService,
        { provide: RequestService, useValue: requestServiceMock }
      ]
    });

    handler = TestBed.inject(VerifyMarkedTicketHandler);
    storage = TestBed.inject(RefundStorage);

    // Arrange common storage mocks
    storage.getMatch = jest.fn().mockReturnValue(match);
    storage.getSelectedResource = jest.fn().mockReturnValue(selectedResources);
    storage.error = jest.fn();

    // Chain next handler
    nextHandler = { handle: jest.fn() };
    handler.setNextHandler(nextHandler as any);
  });

  it('should call error when marked ticket exists and not call next handler', async () => {
    // Arrange
    requestServiceMock.checkingMarkedTicket.mockResolvedValue({ isExistMarkedTicket: true });

    // Act
    await handler.handle(storage);

    // Assert
    expect(requestServiceMock.checkingMarkedTicket).toHaveBeenCalledWith('00,01', 123);
    expect(storage.error).toHaveBeenCalledWith(Language.MarkedTicket);
    expect(nextHandler.handle).not.toHaveBeenCalled();
  });

  it('should call next handler when no marked ticket exists', async () => {
    // Arrange
    requestServiceMock.checkingMarkedTicket.mockResolvedValue({ isExistMarkedTicket: false });

    // Act
    await handler.handle(storage);

    // Assert
    expect(requestServiceMock.checkingMarkedTicket).toHaveBeenCalledWith('00,01', 123);
    expect(storage.error).not.toHaveBeenCalled();
    expect(nextHandler.handle).toHaveBeenCalledWith(storage);
  });
});
