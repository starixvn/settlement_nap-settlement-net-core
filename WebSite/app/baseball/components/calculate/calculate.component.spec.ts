import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CalculateComponent } from './calculate.component';
import { CalculateStorage } from '../../services/calculate/calculate.storage';
import { HttpClientModule } from '@angular/common/http';
import { BlockUIService, HttpRequestService } from '../../../shared/services';
import { VerificationBaseService } from '../../../core/services/verification-base.service';
import { ResultByTeamNamePipe } from '../../../shared/pipes/result-by-team-name.pipe';
import { Match } from '../../models/match.model';
import { MatchDetail } from '../../../shared/models/sportsbook-sop';

describe('CalculateComponent', () => {
  let component: CalculateComponent;
  let fixture: ComponentFixture<CalculateComponent>;
  let calculateStorage: CalculateStorage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, CalculateComponent, HttpClientModule],
      providers: [
        CalculateStorage,
        BlockUIService,
        HttpRequestService,
        VerificationBaseService,
        ResultByTeamNamePipe
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculateComponent);
    component = fixture.componentInstance;
    calculateStorage = TestBed.inject(CalculateStorage);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch match details', async () => {
    const matchId = 123;
    const mockMatch = new Match(new MatchDetail());
    spyOn(calculateStorage, 'fetchMatch').and.returnValue(Promise.resolve());
    spyOn(calculateStorage, 'getMatchDetail').and.returnValue(mockMatch);

    await component.getMatch(matchId);

    expect(calculateStorage.fetchMatch).toHaveBeenCalledWith(matchId);
    expect(component.isReadyMatch).toBe(true);
    expect(component.match).toEqual(mockMatch);
  });

  it('should set isResettleTickets when checkbox is changed', () => {
    const isChecked = true;
    calculateStorage.setReSettledTickets = jest.fn();

    component.onResettleCheckboxChange(isChecked);

    expect(calculateStorage.setReSettledTickets).toHaveBeenCalledWith(isChecked);
  });

  it('should set applyHedgeMatch when checkbox is changed', () => {
    const isChecked = true;
    calculateStorage.setIsApplyHedgeMatch = jest.fn();

    component.changeApplyHedgeMatch(isChecked);

    expect(calculateStorage.setIsApplyHedgeMatch).toHaveBeenCalledWith(isChecked);
  });
});