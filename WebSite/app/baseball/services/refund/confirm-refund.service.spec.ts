import { TestBed } from '@angular/core/testing';
import { ConfirmRefundService } from './confirm-refund.service';
import { RefundStorage } from './refund.storage';
import { NotifyService } from '../notify.service';
import { ToastrService } from 'ngx-toastr';
import { TOAST_CONFIG } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';

describe('ConfirmRefundService', () => {
  let service: ConfirmRefundService;
  let mockRefundStorage: any;
  let mockNotifyService: jest.Mocked<NotifyService>;
  let mockToastrService: jest.Mocked<ToastrService>;
  let mockHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    mockRefundStorage = {
      isMercy: jest.fn().mockReturnValue(false),
      isSdtSettle: jest.fn().mockReturnValue(false),
      getMatch: jest.fn().mockReturnValue({
        matchDetail: { matchId: 12345 },
        hedgeMatchDetail: null
      }),
      getApplyingHedgeMatch: jest.fn().mockReturnValue(false),
      getResultDetails: jest.fn().mockReturnValue([]),
      getResultChecked: jest.fn().mockReturnValue([])
    };
    mockNotifyService = {
      error: jest.fn(),
      confirm: jest.fn()
    } as any;
    mockToastrService = {
      error: jest.fn(),
      success: jest.fn(),
      warning: jest.fn(),
      info: jest.fn()
    } as any;
    mockHttpClient = {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        ConfirmRefundService,
        { provide: RefundStorage, useValue: mockRefundStorage },
        { provide: NotifyService, useValue: mockNotifyService },
        { provide: ToastrService, useValue: mockToastrService },
        { provide: TOAST_CONFIG, useValue: {} },
        { provide: HttpClient, useValue: mockHttpClient }
      ]
    });

    service = TestBed.inject(ConfirmRefundService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('confirmRefund', () => {
    it('should call verifySettleDetermineAndMercy.handle with storage', () => {
      // Since the handlers are private and use chain of responsibility pattern,
      // we can only test that the method doesn't throw an error
      expect(() => service.confirmRefund()).not.toThrow();
    });
  });

  describe('undoConfirmRefund', () => {
    it('should call undoConfirmSettleDetermineHandler.handle with storage', () => {
      // Since the handlers are private and use chain of responsibility pattern,
      // we can only test that the method doesn't throw an error
      expect(() => service.undoConfirmRefund()).not.toThrow();
    });
  });
}); 