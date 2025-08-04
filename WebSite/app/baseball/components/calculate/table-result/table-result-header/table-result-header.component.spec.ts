import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TableResultHeaderComponent } from './table-result-header.component';
import { CalculateStorage } from '../../../../services/calculate/calculate.storage';
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

    const mockCalculateStorage = {
      getMatch: () => mockMatch
    };

    await TestBed.configureTestingModule({
      imports: [TableResultHeaderComponent, HttpClientTestingModule],
      providers: [
        { provide: CalculateStorage, useValue: mockCalculateStorage }
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
