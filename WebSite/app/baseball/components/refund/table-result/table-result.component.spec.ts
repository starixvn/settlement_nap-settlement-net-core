import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TableResultComponent } from './table-result.component';
import { Match } from '../../../models/match.model';
import { MatchDetail } from '../../../../shared/models/sportsbook-sop/match-detail.model';
import { RefundStorage } from '../../../services/refund/refund.storage';
import { ConfirmRefundService } from '../../../services/refund/confirm-refund.service';
import { RefundService } from '../../../services/refund/refund.service';
import { NotifyService } from '../../../services/notify.service';
import { IntervalBackgroundPipe } from '../../../../shared/pipes/interval-background.pipe';

describe('TableResultComponent', () => {
  let component: TableResultComponent;
  let fixture: ComponentFixture<TableResultComponent>;

  beforeEach(async () => {
    const mockMatch = new Match(new MatchDetail());
    mockMatch.resultDetails = [];
    mockMatch.hedgeMatchDetail = null;
    mockMatch.permission = { 
      canRefund: true, 
      canCalculate: true, 
      canUncalculate: true,
      isLeader: false,
      canChangeScoreSource: true,
      isTrader: false,
      canViewSettlementLog: true,
      canAutoPayout: true,
      canMarkPending: true,
      canMarkUnDecided: true,
      canUncalculateInstant: true
    };
    
    mockMatch.matchDetail.homeName = 'Home';
    mockMatch.matchDetail.awayName = 'Away';

    const mockRefundStorage = {
      getMatch: () => mockMatch,
      getExternalResults: () => [],
      getResultChecked: () => [],
      isMatchSeries: () => false,
      isSdtSettle: () => false,
      isMercy: () => false,
      isSelectedMatch: () => false
    };

    const mockConfirmRefundService = {
      confirmRefund: () => {}
    };

    const mockRefundService = {
      refund: () => {}
    };

    const mockNotifyService = {
      notify: () => {}
    };

    const mockBackgroundPipe = {
      transform: () => ''
    };

    await TestBed.configureTestingModule({
      imports: [TableResultComponent, HttpClientTestingModule],
      providers: [
        { provide: RefundStorage, useValue: mockRefundStorage },
        { provide: ConfirmRefundService, useValue: mockConfirmRefundService },
        { provide: RefundService, useValue: mockRefundService },
        { provide: NotifyService, useValue: mockNotifyService },
        { provide: IntervalBackgroundPipe, useValue: mockBackgroundPipe }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TableResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
