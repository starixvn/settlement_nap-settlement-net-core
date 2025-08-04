import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableResultFooterComponent } from './table-result-footer.component';
import { EarlySettlementStorage } from '../../../../services/early-settlement/early-settlement.storage';
import { EarlySettlementService } from '../../../../services/early-settlement/early-settlement.service';
import { NotifyService } from '../../../../services/notify.service';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Language } from '../../../../../shared/language.native';
import { Permission } from '../../../../../shared/models/sportsbook-sop';

// Mock Permission object
const mockPermission: Permission = {
  canCalculate: true,
  canUncalculate: true,
  canRefund: true,
  isLeader: true,
  canChangeScoreSource: true,
  isTrader: true,
  canViewSettlementLog: true,
  canAutoPayout: true,
  canMarkPending: true,
  canMarkUnDecided: true,
  canUncalculateInstant: true
};

describe('TableResultFooterComponent', () => {
  let component: TableResultFooterComponent;
  let fixture: ComponentFixture<TableResultFooterComponent>;
  let mockStorage: any;
  let mockService: any;
  let mockNotify: any;

  beforeEach(async () => {
    mockStorage = {
      getResultChecked: jest.fn().mockReturnValue([]),
      getResultDetails: jest.fn().mockReturnValue([]),
      getMatch: jest.fn().mockReturnValue({ resultDetails: [], permission: mockPermission }),
      getPermission: jest.fn().mockReturnValue(mockPermission),
      isReadyMatch: jest.fn().mockReturnValue(true),
      getFullTime: jest.fn().mockReturnValue({ isSpecialBettype: false }),
      disableAction: false,
      setActionSubmit: jest.fn()
    };
    mockService = {
      earlySettlement: jest.fn(),
      unEarlySettlement: jest.fn(),
      calculate: jest.fn(),
      unCalculate: jest.fn(),
      saveScore: jest.fn(),
      confirmResult: jest.fn(),
      unConfirmResult: jest.fn(),
      refund: jest.fn()
    };
    mockNotify = {
      clearError: jest.fn(),
      confirm: jest.fn((msg, cb) => cb && cb())
    };

    await TestBed.configureTestingModule({
      imports: [TableResultFooterComponent, HttpClientTestingModule, ToastrModule.forRoot()],
      providers: [
        { provide: EarlySettlementStorage, useValue: mockStorage },
        { provide: EarlySettlementService, useValue: mockService },
        { provide: NotifyService, useValue: mockNotify }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TableResultFooterComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call calculate', () => {
    component.calculate();
    expect(mockNotify.clearError).toHaveBeenCalled();
    expect(mockStorage.setActionSubmit).toHaveBeenCalled();
    expect(mockService.calculate).toHaveBeenCalled();
  });

  it('should call unCalculate', () => {
    component.unCalculate();
    expect(mockNotify.clearError).toHaveBeenCalled();
    expect(mockStorage.setActionSubmit).toHaveBeenCalled();
    expect(mockService.unCalculate).toHaveBeenCalled();
  });

  it('should call saveResult', () => {
    component.saveResult();
    expect(mockNotify.clearError).toHaveBeenCalled();
    expect(mockNotify.confirm).toHaveBeenCalledWith(Language.eSports.saveScore, expect.any(Function));
    expect(mockService.saveScore).toHaveBeenCalled();
  });

  it('should call confirmRefund (unConfirmResult)', () => {
    mockStorage.getResultChecked.mockReturnValue([{ resultSettingData: { isConfirmedRefund: true }, resourceId: 'id1' }]);
    component.confirmRefund();
    expect(mockNotify.clearError).toHaveBeenCalled();
    expect(mockService.unConfirmResult).toHaveBeenCalled();
  });

  it('should call confirmRefund (confirmResult)', () => {
    mockStorage.getResultChecked.mockReturnValue([{ resultSettingData: {}, resourceId: 'id2' }]);
    component.confirmRefund();
    expect(mockNotify.clearError).toHaveBeenCalled();
    expect(mockService.confirmResult).toHaveBeenCalled();
  });

  it('should call refund', () => {
    component.refund();
    expect(mockNotify.clearError).toHaveBeenCalled();
    expect(mockStorage.setActionSubmit).toHaveBeenCalled();
    expect(mockService.refund).toHaveBeenCalled();
  });
});
