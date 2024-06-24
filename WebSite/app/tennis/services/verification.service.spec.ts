import { TestBed, inject } from '@angular/core/testing';
import { IntervalCalculationService } from '../../shared/services';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalContentDialogComponent, ModalDialogComponent } from '../../shared/components';
import { VerificationService } from './verification.service';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';

export class CreateDataTest {
  public static CreateResultDetail(
    id: string,
    home: string,
    away: string,
    ticketStatus: string,
    settlementStatusId: number) {
    const item = new ResultDetail();
    item.resourceId = id;
    item.homeValue = home;
    item.awayValue = away;
    item.ticketStatus = ticketStatus;
    item.settlementStatusId = settlementStatusId;
    return item;
  }
}

describe('Tennis', () => {
  let service: VerificationService = null;
  const resultDetail = new ResultDetail();
  resultDetail.resourceId = "0101";
  resultDetail.ticketStatus = "";
  resultDetail.map = 0;
  resultDetail.betType = "";
  resultDetail.betTypeName = "";
  resultDetail.awayValue = "1";
  resultDetail.homeValue = "2";
  resultDetail.resultStatusId = 1;
  resultDetail.settlementStatusId = 4;
  resultDetail.resultStatus = "";
  resultDetail.checked = true;
  resultDetail.isResultWarning = false;
  resultDetail.originalHomeValue = '';
  resultDetail.originalAwayValue = '';
  resultDetail.isShow = true;

  const resultDetails: ResultDetail[] = [];

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ModalDialogComponent,
        ModalContentDialogComponent,
      ],
      providers: [
        IntervalBackgroundPipe,
        VerificationService,
        IntervalCalculationService,
        NgbModule,
        ResultByTeamNamePipe
      ],
      imports: [
        NgbModule
      ],
    });

    service = TestBed.inject(VerificationService);
  });

  beforeEach(inject([VerificationService], (verificationService: VerificationService) => {
    service = verificationService;
  }));

  it('should create a service', () => {
    expect(service).toBeTruthy();
  });

  it("verifyMatchScoreOnCalculation - should call service", () => {
    const intervalCalculationService = TestBed.inject(IntervalCalculationService);
    spyOn(intervalCalculationService, 'isMatchNotCheckedWhenChangingIntervals');
    service.verifyMatchScoreOnCalculation(resultDetails);

    expect(intervalCalculationService.isMatchNotCheckedWhenChangingIntervals).toHaveBeenCalled();
  });

  describe('verifyIntervalsOnCalculation', () => {
    it('should alert when first validation return true', () => {
      const intervalCalculationService = TestBed.inject(IntervalCalculationService);
      spyOn(intervalCalculationService, 'isIntervalNotCheckedWhenCalculateMatch').and.returnValue(true);
      const actual = service.verifyIntervalsOnCalculation(resultDetails, false);

      expect(actual).toEqual("WARNING! Cannot continue due to related intervals are not selected or calculated.");
    });

    it('should alert when second validation return true', () => {
      const intervalCalculationService = TestBed.inject(IntervalCalculationService);
      spyOn(intervalCalculationService, 'isIntervalNotCheckedWhenCalculateMatch').and.returnValue(false);
      spyOn(intervalCalculationService, 'isNonCheckedIntervalsConsistent').and.returnValue(true);
      const actual = service.verifyIntervalsOnCalculation(resultDetails, false);

      expect(actual).toEqual("WARNING! Cannot continue due to selected intervals are inconsistent with Match/Full Time score.");
    });

    it('should return true when both validations are passed', () => {
      const intervalCalculationService = TestBed.inject(IntervalCalculationService);
      spyOn(intervalCalculationService, 'isIntervalNotCheckedWhenCalculateMatch').and.returnValue(false);
      spyOn(intervalCalculationService, 'isNonCheckedIntervalsConsistent').and.returnValue(false);
      const result = service.verifyIntervalsOnCalculation(resultDetails, false);

      expect(result).toEqual("");
    });
  });
});