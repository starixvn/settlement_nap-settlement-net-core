import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TableResultBodyComponent } from './table-result-body.component';
import { EarlySettlementStorage } from '../../../../services/early-settlement/early-settlement.storage';
import { EarlySettlementService } from '../../../../services/early-settlement/early-settlement.service';
import { AioService } from '../../../../../shared/services';
import { VerificationBaseService } from '../../../../../core/services/verification-base.service';
import { ToastrModule } from 'ngx-toastr';

describe('TableResultBodyComponent', () => {
  let component: TableResultBodyComponent;
  let fixture: ComponentFixture<TableResultBodyComponent>;

  beforeEach(async () => {
    const mockEarlySettlementStorage = {
      getResultChecked: () => [],
      getResultDetails: () => [],
      getMatch: () => ({ resultDetails: [] }),
      getPermission: () => ({ isLeader: false, canRefund: true, canCalculate: true }),
      getMatchDetail: () => ({ homeName: 'Home', awayName: 'Away' }),
      isLeader: () => false,
      isMatchSeries: () => false,
      getAllInnings: () => [],
      isScoreDirect: () => false,
      fulltimeResult: { externalScores: [] },
      getGroupResultDetail: () => [],
      match: () => ({ matchDetail: { matchId: 123 } }),
      resultType: [],
      ticketStatus: [],
      resultStatus: []
    };

    const mockEarlySettlementService = {
      earlySettlement: () => {},
      unEarlySettlement: () => {}
    };

    const mockAioService = {
      getData: () => {}
    };

    const mockVerificationService = {
      isMismatchedWarning: () => false
    };

    await TestBed.configureTestingModule({
      imports: [TableResultBodyComponent, HttpClientTestingModule, ToastrModule.forRoot()],
      providers: [
        { provide: EarlySettlementStorage, useValue: mockEarlySettlementStorage },
        { provide: EarlySettlementService, useValue: mockEarlySettlementService },
        { provide: AioService, useValue: mockAioService },
        { provide: VerificationBaseService, useValue: mockVerificationService }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TableResultBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
