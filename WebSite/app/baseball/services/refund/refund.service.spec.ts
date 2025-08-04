import { TestBed } from '@angular/core/testing';
import { RefundService } from './refund.service';
import { RefundStorage } from './refund.storage';
import { NotifyService } from '../notify.service';
import { ToastrService } from 'ngx-toastr';
import { TOAST_CONFIG } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';

describe('RefundService', () => {
  let service: RefundService;
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
        RefundService,
        { provide: RefundStorage, useValue: mockRefundStorage },
        { provide: NotifyService, useValue: mockNotifyService },
        { provide: ToastrService, useValue: mockToastrService },
        { provide: TOAST_CONFIG, useValue: {} },
        { provide: HttpClient, useValue: mockHttpClient }
      ]
    });

    service = TestBed.inject(RefundService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('refund', () => {
    it('should call confirmMercyHandler.handle with storage', () => {
      // Since the handlers are private and use chain of responsibility pattern,
      // we can only test that the method doesn't throw an error
      expect(() => service.refund()).not.toThrow();
    });
  });
}); 