import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TableResultHeaderComponent } from './table-result-header.component';
import { EarlySettlementStorage } from '../../../../services/early-settlement/early-settlement.storage';
import { Match } from '../../../../models/match.model';
import { MatchDetail } from '../../../../../shared/models/sportsbook-sop';

describe('TableResultHeaderComponent', () => {
  let component: TableResultHeaderComponent;
  let fixture: ComponentFixture<TableResultHeaderComponent>;

  beforeEach(async () => {
    const mockMatch = new Match(new MatchDetail());
    mockMatch.resultDetails = [{
      externalScores: [],
      checked: false,
      isShow: true
    } as any];
    mockMatch.matchDetail.providerCount = 2;
    (mockMatch.matchDetail as any).isLeader = false;
    (mockMatch.matchDetail as any).homeName = 'Home';
    (mockMatch.matchDetail as any).awayName = 'Away';
    mockMatch.permission = {
      isLeader: false,
      canRefund: true,
      canCalculate: true
    } as any;

    const mockEarlySettlementStorage = {
      getMatch: () => mockMatch,
      getPermission: () => ({ isLeader: false, canRefund: true, canCalculate: true }),
      getGroupResultDetail: () => [],
      updateFilter: () => {},
      match: () => mockMatch
    };

    await TestBed.configureTestingModule({
      imports: [TableResultHeaderComponent, HttpClientTestingModule, NoopAnimationsModule],
      providers: [
        { provide: EarlySettlementStorage, useValue: mockEarlySettlementStorage }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TableResultHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
