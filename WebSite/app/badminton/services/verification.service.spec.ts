import { TestBed, inject } from '@angular/core/testing';
import { IntervalCalculationService } from '../../shared/services';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { VerificationService } from '.';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { ResultDetail } from '../../shared/models/sportsbook-sop/result-detail.model';
import { ExternalResultDetail } from '../../shared/models/sportsbook-sop';
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';
import { ModalContentDialogComponent } from '../../shared/components/modal-dialog/modal-content-dialog.component';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ModalDialogComponent } from '../../shared/components/modal-dialog/modal-dialog.component';

describe('VerificationService', () => {
  let service: VerificationService = null;
  const resultDetail = new ResultDetail();
  const externalResultDetail = new ExternalResultDetail(1, '1', '', '', '2', '1');
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
        NgbModule,
        ResultByTeamNamePipe,
        IntervalCalculationService,
      ],
      imports: [
        NgbModule
      ],
    })
      .overrideModule(BrowserDynamicTestingModule, {
        set: {
          entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
        },
      });
    service = TestBed.inject(VerificationService);
  });

  beforeEach(inject([VerificationService], (verificationService: VerificationService) => {
    service = verificationService;
  }));

  it('should create a service', () => {
    expect(service).toBeTruthy();
  });

  it('isExistInhouseResult - should return externalResultDetail when result has inhouse result', () => {
    resultDetail.externalScores = [externalResultDetail];
    externalResultDetail.homeValue = '1';

    const result = service.isExistInhouseResult(resultDetail);

    expect(result).toEqual(externalResultDetail);
  });

  describe('hasTicketBetOnMap', () => {
    it('should return true if exist tickets on map', () => {
      resultDetail.ticketStatus = 'Running';

      const result = service.hasTicketBetOnMap([resultDetail]);

      expect(result).toBe(true);
    });

    it('should return false if there is no ticket on final', () => {
      resultDetail.ticketStatus = 'No Ticket';

      const result = service.hasTicketBetOnMap([resultDetail]);

      expect(result).toBe(false);
    });
  });

  it("verifyMatchScoreOnCalculation - should call service", () => {
    const intervalCalculationService = TestBed.inject(IntervalCalculationService);
    intervalCalculationService.isMatchNotCheckedWhenChangingIntervals = jest.fn();
    service.verifyMatchScoreOnCalculation(resultDetails);

    expect(intervalCalculationService.isMatchNotCheckedWhenChangingIntervals).toHaveBeenCalled();
  });

  describe('verifyIntervalsOnCalculation', () => {
    it('should alert when first validation return true', () => {
      const intervalCalculationService = TestBed.inject(IntervalCalculationService);
      intervalCalculationService.isIntervalNotCheckedWhenCalculateMatch = jest.fn().mockReturnValue(true);
      const result = service.verifyIntervalsOnCalculation(resultDetails, false);

      expect(result).toEqual("WARNING! Cannot continue due to related intervals are not selected or calculated.");
    });

    it('should alert when second validation return true', () => {
      const intervalCalculationService = TestBed.inject(IntervalCalculationService);
      intervalCalculationService.isIntervalNotCheckedWhenCalculateMatch = jest.fn().mockReturnValue(false);
      intervalCalculationService.isNonCheckedIntervalsConsistent = jest.fn().mockReturnValue(true);
      const result = service.verifyIntervalsOnCalculation(resultDetails, false);

      expect(result).toEqual("WARNING! Cannot continue due to selected intervals are inconsistent with Match/Full Time score.");
    });

    it('should return true when both validations are passed', () => {
      const intervalCalculationService = TestBed.inject(IntervalCalculationService);
      intervalCalculationService.isIntervalNotCheckedWhenCalculateMatch = jest.fn().mockReturnValue(false);
      intervalCalculationService.isNonCheckedIntervalsConsistent = jest.fn().mockReturnValue(false);
      const result = service.verifyIntervalsOnCalculation(resultDetails, false);

      expect(result).toEqual("");
    });
  });
});