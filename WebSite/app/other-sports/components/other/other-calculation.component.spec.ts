import { HttpClient, HttpClientModule, HttpHandler } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick, flush } from '@angular/core/testing';
import { jest } from '@jest/globals';
import { FormsModule } from '@angular/forms';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastContainerDirective, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { ScorePipe } from '../../pipes';
import { RequestService } from '../../services/request.service';
import { ModalContentDialogComponent } from '../../../shared/components/modal-dialog/modal-content-dialog.component';
import { ModalDialogComponent } from '../../../shared/components/modal-dialog/modal-dialog.component';
import { NotReadyMatchComponent } from '../../../shared/components/not-ready-match/not-ready-match.component';
import { ResettleCheckerComponent } from '../../../shared/components/resettle-checker/resettle-checker.component';
import { TicketCountComponent } from '../../../shared/components/ticket-count/ticket-count.component';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../../shared/services';

import { OtherCalculationComponent } from './other-calculation.component';
import { OtherService } from './other.service';
import { VerificationService } from './verification.service';
import { Match } from '../../models/match.model';
import { MatchDetail, OtherSportsMatch, Permission } from '../../models';
import { of } from 'rxjs';
import { HedgeMatchDetail } from '../../../shared/models/sportsbook-sop';

describe('OtherCalculationComponent', () => {
  let component: OtherCalculationComponent;
  let fixture: ComponentFixture<OtherCalculationComponent>;
  let requestService: RequestService;
  let otherService: OtherService;
  let verificationService: VerificationService;
  let toastrService: ToastrService;
  let messageBoxService: MessageBoxService;

  const successfulResult = {
    errCode: 0,
    errMsg: "",
    isSuccessful: true,
    childMatchIds: "",
    settledSessionId: "",
    hasResultAmendment: false,
    isOrg: false
  };

  const unsuccessfulResult = {
    errCode: 1,
    errMsg: "abc",
    isSuccessful: false,
    childMatchIds: "",
    settledSessionId: "",
    hasResultAmendment: false,
    isOrg: false
  };

  const buttonName = "btn-danger";

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        OtherCalculationComponent,
        ScorePipe
      ],
              imports: [
          HttpClientModule,
          NgbModule,
          FormsModule,
          NoopAnimationsModule,
          ToastNoAnimationModule.forRoot(),
          ToastrModule.forRoot(),
          ModalDialogComponent,
          ModalContentDialogComponent,
          TicketCountComponent,
          ResettleCheckerComponent,
          NotReadyMatchComponent
        ],
      providers: [
        RequestService,
        OtherService,
        VerificationService,
        MessageBoxService,
        HttpRequestService,
        HttpClient,
        BlockUIService,
        HttpHandler,
        NgbModal,
        ToastContainerDirective,
        { provide: ToastrService, useClass: ToastrService },
        { provide: MessageBoxService, useClass: MessageBoxService },
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherCalculationComponent);
    component = fixture.componentInstance;
    requestService = fixture.debugElement.injector.get(RequestService);
    otherService = fixture.debugElement.injector.get(OtherService);
    verificationService = fixture.debugElement.injector.get(VerificationService);
    toastrService = fixture.debugElement.injector.get(ToastrService);
    messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
    jest.spyOn(toastrService, 'clear');
    jest.spyOn(toastrService, 'error');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getMatch - should get match and map properties', async () => {
    const matchId = 12345
    const otherSportMatch = {
      match: {
        matchDetail: {matchId} as MatchDetail,
      } as Match,
      permission: {} as Permission,
    } as OtherSportsMatch;
    jest.spyOn(requestService, 'getMatch').mockReturnValue(Promise.resolve(otherSportMatch));
    jest.spyOn(otherService, 'showButtonBySportType').mockReturnValue(true);
    jest.spyOn(otherService, 'isReadyMatch').mockReturnValue(true);
    jest.spyOn(otherService, 'initScoreByPermission');
    jest.spyOn(verificationService, 'isScoreInconsistent');
    jest.spyOn(verificationService, 'isHaltTimeScoreMismatched');
    jest.spyOn(verificationService, 'isFinalScoreMismatched');
    jest.spyOn(verificationService, 'isHtScoreConfirmed');
    jest.spyOn(verificationService, 'isFinalScoreConfirmed');

    await component.getMatch(matchId);

    expect(component.matchDetail.matchId).toEqual(matchId);
    expect(verificationService.isScoreInconsistent).toHaveBeenCalled();
    expect(verificationService.isHaltTimeScoreMismatched).toHaveBeenCalled();
    expect(verificationService.isFinalScoreMismatched).toHaveBeenCalled();
    expect(verificationService.isHtScoreConfirmed).toHaveBeenCalled();
    expect(verificationService.isFinalScoreConfirmed).toHaveBeenCalled();
    expect(otherService.showButtonBySportType).toHaveBeenCalled();
    expect(otherService.isReadyMatch).toHaveBeenCalled();
    expect(otherService.initScoreByPermission).toHaveBeenCalled();
  });

  describe('externalSourceName', () => {
    it('should return dash when source name not exist', () => {
      component.matchDetail = {} as MatchDetail;
      expect(component.externalSourceName).toEqual('-');
    });

    it('should return source name when source name exist', () => {
      component.matchDetail = {externalSourceName: 'Fake Name'} as MatchDetail;
      expect(component.externalSourceName).toEqual('Fake Name');
    });
  });

  describe('halftimeTicketStatusBackground - fullTimeTicketStatusBackground', () => {
    it('should return calculated background when status is calculated', () => {
      component.matchDetail = {htStatus: 'Calculated'} as MatchDetail;

      expect(component.halftimeTicketStatusBackground).toEqual('bg-calculated');
    });

    it('should return marked background when status is marked', () => {
      component.matchDetail = {htStatus: 'Marked'} as MatchDetail;

      expect(component.halftimeTicketStatusBackground).toEqual('bg-marked');
    });

    it('should return empty background when status is running', () => {
      component.matchDetail = {ftStatus: 'Running'} as MatchDetail;

      expect(component.fullTimeTicketStatusBackground).toEqual('');
    });
  });

  it('onResettleCheckboxChange - should check re-settle tickets', () => {
    component.onResettleCheckboxChange(true);
    expect(component.isReSettledTickets).toBe(true);
  });

  describe('isHtErrorOnVerification', () => {
    it ('should return true when clicked calculate HT and score is null', () => {
      component.clickedCalculateHalfTime = true;
      expect(component.isHtErrorOnVerification(null)).toBe(true);
    });

    it ('should return false when clicked calculate HT and score is valid', () => {
      component.clickedCalculateHalfTime = true;
      expect(component.isHtErrorOnVerification(3)).toBe(false);
    });
  });

  describe('isFinalErrorOnVerification', () => {
    it ('should return true when clicked calculate HT and score is null', () => {
      component.clickedCalculateFullTime = true;
      expect(component.isFinalErrorOnVerification(null)).toBe(true);
    });

    it ('should return false when clicked calculate HT and score is valid', () => {
      component.clickedCalculateFullTime = true;
      expect(component.isFinalErrorOnVerification(3)).toBe(false);
    });
  });

  it('changeScore - should invoke verify score functions', () => {
    component.matchDetail = {} as MatchDetail;
    jest.spyOn(verificationService, 'isScoreInconsistent');
    jest.spyOn(verificationService, 'isHaltTimeScoreMismatched');
    jest.spyOn(verificationService, 'isFinalScoreMismatched');

    component.changeScore();

    expect(verificationService.isScoreInconsistent).toHaveBeenCalled();
    expect(verificationService.isHaltTimeScoreMismatched).toHaveBeenCalled();
    expect(verificationService.isFinalScoreMismatched).toHaveBeenCalled();
  });

  describe('actionCopyScore', () => {
    it('should pop error when full time is settled', () => {
      component.matchDetail = { isFullTimeSettled: true } as MatchDetail;

      component.actionCopyScore();

      expect(toastrService.error).toHaveBeenCalledWith("WARNING! Cannot proceed due to settled match.");
    });

    it('should pop error when half time is settled and no full time score exist', () => {
      component.matchDetail = { isHalfTimeSettled: true } as MatchDetail;

      component.actionCopyScore();

      expect(toastrService.error).toHaveBeenCalledWith("WARNING! Cannot proceed due to settled HALF TIME.");
    });

    it('should confirm and copy final score when half time is settled and there is full time score', fakeAsync(() => {
      component.matchDetail = {
        isHalfTimeSettled: true,
        exFTHomeScore: 1,
        exFTAwayScore: 2
      } as MatchDetail;
      jest.spyOn(otherService, 'copyFinalScore');

      component.actionCopyScore();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(otherService.copyFinalScore).toHaveBeenCalled();
    }));

    it('should pop error when there is not any score', () => {
      component.matchDetail = { } as MatchDetail;

      component.actionCopyScore();

      expect(toastrService.error).toHaveBeenCalledWith("WARNING! Cannot proceed due to missing score from SBO.");
    });

    it('should confirm and copy final score when half time score is invalid and full time score is valid', fakeAsync(() => {
      component.matchDetail = {
        exFTHomeScore: 1,
        exFTAwayScore: 2
      } as MatchDetail;
      jest.spyOn(otherService, 'copyFinalScore');

      component.actionCopyScore();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(otherService.copyFinalScore).toHaveBeenCalled();
    }));

    it('should confirm and copy half time score when half time score is valid and full time score is invalid', fakeAsync(() => {
      component.matchDetail = {
        exHTHomeScore: 1,
        exHTAwayScore: 2
      } as MatchDetail;
      jest.spyOn(otherService, 'copyHalfTimeScore');

      component.actionCopyScore();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(otherService.copyHalfTimeScore).toHaveBeenCalled();
    }));

    it('should confirm and copy both score when both score is valid', fakeAsync(() => {
      component.matchDetail = {
        exFTHomeScore: 1,
        exFTAwayScore: 2,
        exHTHomeScore: 0,
        exHTAwayScore: 1
      } as MatchDetail;
      jest.spyOn(otherService, 'copyScores');

      component.actionCopyScore();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(otherService.copyScores).toHaveBeenCalled();
    }));
  });

  describe('calculateHalfTime', () => {
    it('should pop error when half time score is invalid', () => {
      jest.spyOn(verificationService, 'isHalfTimeScoreInvalid').mockReturnValue(true);

      component.calculateHalfTime();

      expect(toastrService.error).toHaveBeenCalledWith("Please input score accordingly.");
    });

    it('should pop error when score is inconsistent', () => {
      jest.spyOn(verificationService, 'isHalfTimeScoreInvalid').mockReturnValue(false);
      component.isScoreInconsistent = true;

      component.calculateHalfTime();

      expect(toastrService.error)
        .toHaveBeenCalledWith("WARNING! Cannot continue due to scores inconsistency. Please recheck and try again.");
    });

    it('should pop error when half time score is mismatched', () => {
      jest.spyOn(verificationService, 'isHalfTimeScoreInvalid').mockReturnValue(false);
      jest.spyOn(verificationService, 'isScoreSourceInsufficient').mockReturnValue(false);
      component.isHtScoreMismatched = true;
      component.permission = {} as Permission;

      component.calculateHalfTime();

      expect(toastrService.error).toHaveBeenCalledWith("WARNING! Insufficient or inconsistent score sources. Please check and try again");
    });
  });

  describe('calculateFullTime', () => {
    it('should pop error when full time score is invalid', () => {
      jest.spyOn(verificationService, 'isFinalScoreInvalid').mockReturnValue(true);

      component.calculateFullTime();

      expect(toastrService.error).toHaveBeenCalledWith("Please input score accordingly.");
    });

    it('should pop error when score is inconsistent', () => {
      jest.spyOn(verificationService, 'isFinalScoreInvalid').mockReturnValue(false);
      component.isScoreInconsistent = true;

      component.calculateFullTime();

      expect(toastrService.error)
        .toHaveBeenCalledWith("WARNING! Cannot continue due to scores inconsistency. Please recheck and try again.");
    });

    it('should pop error when full time score is mismatched', () => {
      jest.spyOn(verificationService, 'isFinalScoreInvalid').mockReturnValue(false);
      jest.spyOn(verificationService, 'isScoreSourceInsufficient').mockReturnValue(false);
      component.isFinalScoreMismatched = true;
      component.permission = {} as Permission;

      component.calculateFullTime();

      expect(toastrService.error).toHaveBeenCalledWith("WARNING! Insufficient or inconsistent score sources. Please check and try again");
    });
  });

  describe('calculateAll', () => {
    it('should pop error when half time score is invalid', () => {
      jest.spyOn(verificationService, 'isScoreInvalid').mockReturnValue(true);

      component.calculateAll();

      expect(toastrService.error).toHaveBeenCalledWith("Please input score accordingly.");
    });

    it('should pop error when score is inconsistent', () => {
      jest.spyOn(verificationService, 'isScoreInvalid').mockReturnValue(false);
      component.isScoreInconsistent = true;

      component.calculateAll();

      expect(toastrService.error)
        .toHaveBeenCalledWith("WARNING! Cannot continue due to scores inconsistency. Please recheck and try again.");
    });

    it('should pop error when full time score is mismatched', () => {
      jest.spyOn(verificationService, 'isScoreInvalid').mockReturnValue(false);
      jest.spyOn(verificationService, 'isScoreSourceInsufficient').mockReturnValue(true);
      component.isFinalScoreMismatched = true;
      component.permission = {} as Permission;

      component.calculateAll();

      expect(toastrService.error).toHaveBeenCalledWith("WARNING! Insufficient or inconsistent score sources. Please check and try again");
    });

    it('should confirm and calculate successfully when score is insufficient and there is leader', fakeAsync(() => {
      jest.spyOn(verificationService, 'isScoreInvalid').mockReturnValue(false);
      jest.spyOn(verificationService, 'isScoreSourceInsufficient').mockReturnValue(true);
      jest.spyOn(verificationService, 'verifyChangedSettledTickets').mockReturnValue(Promise.resolve(false));
      jest.spyOn(otherService, 'settle').mockReturnValue(Promise.resolve(successfulResult));
      jest.spyOn(messageBoxService, 'closePopup');
      component.matchDetail = {} as MatchDetail;
      component.permission = { isLeader: true } as Permission;

      component.calculateAll();
      tick();
      let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();
      buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();
      buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(messageBoxService.closePopup).toHaveBeenCalled();
    }));

    it('should confirm and calculate successfully when score is mismatched and there is leader', fakeAsync(() => {
      jest.spyOn(verificationService, 'isScoreInvalid').mockReturnValue(false);
      jest.spyOn(verificationService, 'isScoreSourceInsufficient').mockReturnValue(false);
      jest.spyOn(verificationService, 'verifyChangedSettledTickets').mockReturnValue(Promise.resolve(false));
      jest.spyOn(otherService, 'settle').mockReturnValue(Promise.resolve(successfulResult));
      jest.spyOn(messageBoxService, 'closePopup');
      component.matchDetail = {} as MatchDetail;
      component.permission = { isLeader: true } as Permission;
      component.isHtScoreMismatched = true;

      component.calculateAll();
      tick();
      let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();
      buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();
      buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(messageBoxService.closePopup).toHaveBeenCalled();
    }));

    it('should confirm and set re-settle tickets when re-settle is necessary', fakeAsync(() => {
      jest.spyOn(verificationService, 'isScoreInvalid').mockReturnValue(false);
      jest.spyOn(verificationService, 'isScoreSourceInsufficient').mockReturnValue(false);
      jest.spyOn(verificationService, 'verifyChangedSettledTickets').mockReturnValue(Promise.resolve(true));

      component.calculateAll();
      tick();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(component.isReSettledTickets).toBe(true);
    }));
  });

  describe('uncalculate', () => {
    it('should confirm twice and close pop up when uncalculate successfully', fakeAsync(() => {
      jest.spyOn(otherService, 'settle').mockReturnValue(Promise.resolve(successfulResult));
      jest.spyOn(messageBoxService, 'closePopup');
      component.applyHedgeMatch = true;
      component.hedgeMatchDetail = {} as HedgeMatchDetail;
      component.matchDetail = {} as MatchDetail;

      component.uncalculate();
      let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();
      buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(messageBoxService.closePopup).toHaveBeenCalled();
    }));

    it('should pop error when uncalculate unsuccessfully', fakeAsync(() => {
      jest.spyOn(otherService, 'settle').mockReturnValue(Promise.resolve(unsuccessfulResult));

      component.uncalculate();
      let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();
      buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();
      flush();

      expect(toastrService.error).toHaveBeenCalledWith('abc');
    }));
  });
});
