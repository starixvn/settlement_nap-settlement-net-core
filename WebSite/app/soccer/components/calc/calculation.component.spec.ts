import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalculationComponent } from './calculation.component';
import { RequestService } from './services/request.service';
import { VerifyMatchService } from './services/verify-match.service';
import { CalculateStorage } from '../../storage/calculate.storage';
import { ToastContainerDirective } from 'ngx-toastr';
import { Match, MatchDetailSoccer, Score } from './models/match.model';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ClosePopupService } from '../../../shared/services';
import { VerifyScoreGoalService } from './services/verify-score-goal.service';

describe('CalculationComponent', () => {
  let component: CalculationComponent;
  let fixture: ComponentFixture<CalculationComponent>;
  let requestService: RequestService;
  let verifyMatchService: VerifyMatchService;
  let storage: CalculateStorage;

  const matchDetail = {
    matchId: 123,
    eventStatus: 'COMPLETED',
    goalRecord: '1-0',
    isFantasyMatch: false 
  } as MatchDetailSoccer;

  const match: Match = {
    matchDetail,
    childMatches: [],
    permission: null,
    ticketCounts: [],
    resultDetails: [],
    hedgeMatchDetail: null,
    fantasyMatch: null,
    externalResults: [],
    originalResultDetail: null,
    oldMatchDetail: null,
    isClickOnCalculate: false,
    isScoreDirect: false
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CalculationComponent,
        HttpClientModule,
        ToastrModule.forRoot()
      ],
      providers: [
        RequestService,
        VerifyMatchService,
        CalculateStorage,
        ToastrService,
        ClosePopupService,
        VerifyScoreGoalService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CalculationComponent);
    component = fixture.componentInstance;
    requestService = fixture.debugElement.injector.get(RequestService);
    verifyMatchService = fixture.debugElement.injector.get(VerifyMatchService);
    storage = fixture.debugElement.injector.get(CalculateStorage);


    component.toastContainer = {} as ToastContainerDirective;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getMatch - should fetch and set match data correctly', async () => {
    requestService.getMatch = jest.fn().mockResolvedValue(match);
    storage.setToastrOverlay = jest.fn();
    storage.setMatch = jest.fn();
    storage.resetHomeAway = jest.fn();

    await component.getMatch(123);

    expect(requestService.getMatch).toHaveBeenCalledWith(123);
    expect(storage.setToastrOverlay).toHaveBeenCalledWith(component.toastContainer);
    expect(storage.setMatch).toHaveBeenCalledWith(match, undefined);
    expect(component.matchDetail).toBe(match.matchDetail);
    expect(component.childMatches).toBe(match.childMatches);
    expect(component.hedgeMatchDetail).toBe(match.hedgeMatchDetail);
    expect(storage.resetHomeAway).toHaveBeenCalled();
  });

  it('onResettleCheckboxChange - should call storage setIsResettleTicket with correct value', () => {
    storage.setIsResettleTicket = jest.fn();

    component.onResettleCheckboxChange(true);

    expect(storage.setIsResettleTicket).toHaveBeenCalledWith(true);
  });

  it('isReSettledTickets - should return value from storage getIsResettleTicket', () => {
    storage.getIsResettleTicket = jest.fn().mockReturnValue(true);

    const result = component.isReSettledTickets;

    expect(result).toBe(true);
    expect(storage.getIsResettleTicket).toHaveBeenCalled();
  });

  it('autoFillFantasyMatch - should set full time and half time scores in storage', () => {
    const score: Score = {
      finalHomeScore: 2,
      finalAwayScore: 1,
      halfTimeHomeScore: 1,
      halfTimeAwayScore: 0
    };
    storage.setFullTimeScore = jest.fn();
    storage.setHaftTimeScore = jest.fn();

    component.autoFillFantasyMatch(score);

    expect(storage.setFullTimeScore).toHaveBeenCalledWith('2', '1');
    expect(storage.setHaftTimeScore).toHaveBeenCalledWith('1', '0');
  });

  it('changeApplyHedgeMatch - should call storage setIsAppleHedgeMatch with current applyHedgeMatch value', () => {
    component.applyHedgeMatch = true;
    storage.setIsAppleHedgeMatch = jest.fn();

    component.changeApplyHedgeMatch();

    expect(storage.setIsAppleHedgeMatch).toHaveBeenCalledWith(true);
  });
});

