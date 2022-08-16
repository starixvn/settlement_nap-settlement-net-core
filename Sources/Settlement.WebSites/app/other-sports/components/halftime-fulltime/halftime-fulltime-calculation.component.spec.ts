import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ResourceHeaderPipe, ScorePipe } from '../../pipes';
import { ModalContentDialogComponent, ModalDialogComponent, NotReadyMatchComponent, ResettleCheckerComponent, TicketCountComponent } from '../../../shared/components';

import { HalfTimeFullTimeCalculationComponent } from './halftime-fulltime-calculation.component';
import { HttpClientModule } from '@angular/common/http';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../services/request.service';
import { BlockUIService, ClosePopupService, HttpRequestService, MessageBoxService } from '../../../shared/services';
import { HalfTimeFullTimeService } from './halftime-fulltime.service';
import { VerificationService } from './verification.service';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ToastContainerDirective, ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { Match, MatchDetail, OtherSportsMatch, Permission, QueryMatch } from '../../models';
import { ResultDetail } from '../../../shared/models/sportsbook-sop/result-detail.model';
import { ResourcesIds } from '../../constants';
import { HedgeMatchDetail } from '../../../shared/models/sportsbook-sop/hedge-match-detail.model';
import { of } from 'rxjs';
import { Language } from '../../../shared/language';

describe('HalfTimeFullTimeCalculationComponent', () => {
  let component: HalfTimeFullTimeCalculationComponent;
  let fixture: ComponentFixture<HalfTimeFullTimeCalculationComponent>;
  let requestService: RequestService;
  let halfTimeFullTimeService: HalfTimeFullTimeService;
  let verificationService: VerificationService;
  let toastrService: ToastrService;
  let messageBoxService: MessageBoxService;
  let closePopupService: ClosePopupService;

  const matchDetail = new MatchDetail();
  const halfTime = new ResultDetail();
  halfTime.resourceId = ResourcesIds.halfTime;
  const fullTime = new ResultDetail();
  fullTime.resourceId = ResourcesIds.fullTime;
  const match: Match = {
    matchDetail,
    resultDetails: [halfTime, fullTime],
    ticketCount: [],
    hedgeMatchDetail: new HedgeMatchDetail()
  }
  const permission = new Permission();
  const otherSportsMatch: OtherSportsMatch = {
    match,
    permission
  }
  const buttonName = "btn-danger";
  const errorMessage = "Error message";
  const successfulResult = {
    errCode: 0,
    errMsg: null,
    isSuccessful: true,
  };
  const unSuccessfulResult = {
    errCode: 1,
    errMsg: errorMessage,
    isSuccessful: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        HalfTimeFullTimeCalculationComponent,
        ModalDialogComponent,
        ModalContentDialogComponent,
        TicketCountComponent,
        ResettleCheckerComponent,
        NotReadyMatchComponent,
        ScorePipe,
        ResourceHeaderPipe
      ],
      imports: [
        HttpClientModule,
        NgbModule,
        FormsModule,
        ToastNoAnimationModule.forRoot(),
        ToastContainerModule,
        ToastrModule.forRoot()
      ],
      providers: [
        RequestService,
        ClosePopupService,
        BlockUIService,
        HttpRequestService,
        HalfTimeFullTimeService,
        VerificationService,
        NgbModal,
        ToastContainerDirective,
        { provide: ToastrService, useClass: ToastrService },
        { provide: MessageBoxService, useClass: MessageBoxService },
      ]
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
      },
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HalfTimeFullTimeCalculationComponent);
    requestService = fixture.debugElement.injector.get(RequestService);
    halfTimeFullTimeService = fixture.debugElement.injector.get(HalfTimeFullTimeService);
    verificationService = fixture.debugElement.injector.get(VerificationService);
    toastrService = fixture.debugElement.injector.get(ToastrService);
    messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
    closePopupService = fixture.debugElement.injector.get(ClosePopupService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('getMatch - Always call function get match and all function related', fakeAsync(() => {
    spyOn(requestService, 'getMatch').and.returnValue(of(otherSportsMatch));
    spyOn(halfTimeFullTimeService, 'processScore');
    spyOn(halfTimeFullTimeService, 'isReadyMatch');
    spyOn(halfTimeFullTimeService, 'numberSetOnHalfTime');
    spyOn(halfTimeFullTimeService, 'sumScore');
    spyOn(halfTimeFullTimeService, 'autoFillOnload');
    spyOn(verificationService, 'isScoreHTInconsistent');
    spyOn(verificationService, 'isScoreFTInconsistent');
    spyOn(verificationService, 'isScoreMismatched');
    spyOn(halfTimeFullTimeService, 'fullTimeConfirmed');
    spyOn(halfTimeFullTimeService, 'halfTimeConfirmed');
    const query = new QueryMatch(1, false);

    component.getMatch(1, "");
    tick();

    expect(requestService.getMatch).toHaveBeenCalledWith(query);
    expect(halfTimeFullTimeService.processScore).toHaveBeenCalled();
    expect(halfTimeFullTimeService.isReadyMatch).toHaveBeenCalled();
    expect(halfTimeFullTimeService.numberSetOnHalfTime).toHaveBeenCalled();
    expect(halfTimeFullTimeService.sumScore).toHaveBeenCalled();
    expect(halfTimeFullTimeService.autoFillOnload).toHaveBeenCalled();
    expect(halfTimeFullTimeService.halfTimeConfirmed).toHaveBeenCalled();
    expect(halfTimeFullTimeService.fullTimeConfirmed).toHaveBeenCalled();
    expect(verificationService.isScoreHTInconsistent).toHaveBeenCalled();
    expect(verificationService.isScoreFTInconsistent).toHaveBeenCalled();
    expect(verificationService.isScoreMismatched).toHaveBeenCalled();
  }));

  it("onResettleCheckboxChange - should change resettle status", () => {
    component.onResettleCheckboxChange(true);
    expect(component.isReSettledTickets).toBe(true);
  });

  describe('externalSourceName', () => {
    it('should return external SourceName when exist', () => {
      matchDetail.externalSourceName = "abc";
      component.matchDetail = matchDetail;

      expect(component.externalSourceName).toBe("abc");
    });

    it('should return dash when not exist source name', () => {
      matchDetail.externalSourceName = null;
      component.matchDetail = matchDetail;

      expect(component.externalSourceName).toBe("-");
    });
  });

  it('should clear error, clear score of sets and call function related', () => {
    component.matchDetail = matchDetail;
    const resultDetail = new ResultDetail();
    resultDetail.resourceId = "1";
    resultDetail.homeValue = "2";
    component.originalResultDetail = [resultDetail];
    component.isScoreDirect = true;
    spyOn(toastrService, 'clear');
    spyOn(verificationService, 'isScoreFTInconsistent');
    spyOn(halfTimeFullTimeService, 'sumScore');
    spyOn(verificationService, 'isScoreMismatched');

    component.changeInputDirectly();

    expect(halfTimeFullTimeService.sumScore).toHaveBeenCalled();
    expect(verificationService.isScoreFTInconsistent).toHaveBeenCalled();
    expect(toastrService.clear).toHaveBeenCalled();
    expect(verificationService.isScoreMismatched).toHaveBeenCalled();
    expect(component.resultDetails[0].homeValue).toBe("");
    expect(component.resultDetails[0].awayValue).toBe("");
  });

  describe('actionCopyScore', () => {
    it('should always clear error', () => {
      component.isScoreDirect = false;
      spyOn(toastrService, 'clear');

      component.actionCopyScore();

      expect(toastrService.clear).toHaveBeenCalled();
    });

    it('should show error when full time is settled', () => {
      component.isScoreDirect = true;
      component.matchDetail = matchDetail;
      component.matchDetail.isFullTimeSettled = true;
      spyOn(toastrService, 'error');

      component.actionCopyScore();

      expect(toastrService.error).toHaveBeenCalledWith(Language.scoreSettledWarning);
    });

    it('should show error when half time is settled and external Ft not exist', () => {
      component.isScoreDirect = true;
      component.matchDetail = matchDetail;
      component.matchDetail.isFullTimeSettled = false;
      component.matchDetail.isHalfTimeSettled = true;
      spyOn(toastrService, 'error');

      component.actionCopyScore();

      expect(toastrService.error).toHaveBeenCalledWith(Language.halfTimeAlreadySettled);
    });

    it('should call func copy score for fulltime when half time is settled and external Ft exist', () => {
      component.isScoreDirect = true;
      matchDetail.exFTAwayScore = 1;
      matchDetail.exFTHomeScore = 2;
      matchDetail.isHalfTimeSettled = true;
      matchDetail.isFullTimeSettled = false;
      matchDetail.externalSourceName = "abc"
      component.matchDetail = matchDetail;
      component.resultDetails = [fullTime];
      spyOn(halfTimeFullTimeService, 'copyScore');

      component.actionCopyScore();

      expect(halfTimeFullTimeService.copyScore).toHaveBeenCalledWith(fullTime, matchDetail, Language.confirmMessageCopySBOScore, "abc");
    });

    it('should show error when final not settle and external score not exist', () => {
      component.isScoreDirect = true;
      matchDetail.exFTAwayScore = null;
      matchDetail.exHTHomeScore = null;
      matchDetail.isHalfTimeSettled = false;
      matchDetail.isFullTimeSettled = false;
      component.matchDetail = matchDetail;
      spyOn(toastrService, 'error');

      component.actionCopyScore();

      expect(toastrService.error).toHaveBeenCalledWith(Language.missingScoreWarning);
    });

    it('should call func copy score for fulltime when final not settle and external score exist full time', () => {
      component.isScoreDirect = true;
      matchDetail.exFTAwayScore = 1;
      matchDetail.exFTHomeScore = 2;
      matchDetail.exHTHomeScore = null;
      matchDetail.isHalfTimeSettled = false;
      matchDetail.isFullTimeSettled = false;
      component.matchDetail = matchDetail;
      component.resultDetails = [fullTime];
      spyOn(halfTimeFullTimeService, 'copyScore');

      component.actionCopyScore();

      expect(halfTimeFullTimeService.copyScore).toHaveBeenCalledWith(fullTime, matchDetail, Language.confirmMessageCopySBOScore, "abc");
    });
    it('should call func copy score for fulltime when final not settle and external score exist half time', () => {
      component.isScoreDirect = true;
      matchDetail.exFTAwayScore = null;
      matchDetail.exHTAwayScore = 2;
      matchDetail.exHTHomeScore = 1;
      matchDetail.isHalfTimeSettled = false;
      matchDetail.isFullTimeSettled = false;
      component.matchDetail = matchDetail;
      component.resultDetails = [fullTime, halfTime];
      spyOn(halfTimeFullTimeService, 'copyScore');

      component.actionCopyScore();

      expect(halfTimeFullTimeService.copyScore).toHaveBeenCalledWith(halfTime, matchDetail, Language.confirmCopyHalfTimeScore, "abc");
    });

    it('should call func copy score for fulltime when final not settle and external score exist both halftime and fulltime', () => {
      component.isScoreDirect = true;
      matchDetail.exFTAwayScore = 1;
      matchDetail.exFTHomeScore = 1;
      matchDetail.exHTAwayScore = 2;
      matchDetail.exHTHomeScore = 1;
      matchDetail.isHalfTimeSettled = false;
      matchDetail.isFullTimeSettled = false;
      component.matchDetail = matchDetail;
      component.resultDetails = [fullTime, halfTime];
      spyOn(halfTimeFullTimeService, 'copyAllScore');

      component.actionCopyScore();

      expect(halfTimeFullTimeService.copyAllScore).toHaveBeenCalled();
    });
  });

  it('checkConsistentScore - should call correct function of service', () => {
    const resultDetail = new ResultDetail();
    resultDetail.awayValue = '1';
    component.hasHalfTime = true;
    component.matchDetail = matchDetail;
    spyOn(halfTimeFullTimeService, 'sumScore').and.returnValue(resultDetail);
    spyOn(verificationService, 'isScoreHTInconsistent');
    spyOn(verificationService, 'isScoreFTInconsistent');

    component.checkConsistentScore();

    expect(component.halfTimeScoreAutoSum).toBe(resultDetail);
    expect(component.finalScoreAutoSum).toBe(resultDetail);
    expect(verificationService.isScoreFTInconsistent).toHaveBeenCalled();
    expect(verificationService.isScoreHTInconsistent).toHaveBeenCalled();
  });

  describe('getClass', () => {
    it('should return class include mismatched when result mismatch', () => {
      halfTime.isScoreMismatched = true;
      halfTime.className = "abc";

      const result = component.getClass(halfTime);

      expect(result).toEqual('abc mismatched');
    });

    it('should return class include not-consistent when result not consistent', () => {
      halfTime.isScoreMismatched = false;
      halfTime.className = "abc";
      fullTime.isScoreMismatched = false;
      fullTime.className = "xyz";
      component.isScoreFTInconsistent = false;
      component.isScoreHTInconsistent = true;

      const result = component.getClass(halfTime);
      const resultSecond = component.getClass(fullTime);

      expect(result).toEqual('abc not-consistent');
      expect(resultSecond).toEqual('xyz');
    });

    it('should return empty or default class of result when result is normal', () => {
      const resultDetail = new ResultDetail();

      const result = component.getClass(resultDetail);

      expect(result).toEqual('');
    });
  });

  describe('isErrorOnVerification', () => {
    it('should return true when result is half time and empty', () => {
      halfTime.homeValue = "";
      halfTime.awayValue = "1";
      component.clickCalcHalfTime = true

      const result = component.isErrorOnVerification(halfTime, halfTime.homeValue);
      const resultSecond = component.isErrorOnVerification(halfTime, halfTime.awayValue);

      expect(result).toBeTruthy();
      expect(resultSecond).toBeFalsy();
    });

    it('should return true when result is full time and empty', () => {
      fullTime.homeValue = "";
      fullTime.awayValue = "1";
      component.clickCalcFullTime = true

      const result = component.isErrorOnVerification(fullTime, fullTime.homeValue);
      const resultSecond = component.isErrorOnVerification(fullTime, fullTime.awayValue);

      expect(result).toBeTruthy();
      expect(resultSecond).toBeFalsy();
    });

    it('should return true when result is one of Half time result  and empty', () => {
      const resultDetail = new ResultDetail();
      resultDetail.homeValue = "";
      resultDetail.awayValue = "1";
      const resultDetailSecond = new ResultDetail();
      resultDetailSecond.homeValue = "";
      component.clickCalcHalfTime = true;
      component.halfTimeNode = 1;
      component.resultDetails = [resultDetail, resultDetailSecond];

      const result = component.isErrorOnVerification(resultDetail, resultDetail.homeValue);
      const resultSecond = component.isErrorOnVerification(resultDetail, resultDetail.awayValue);
      const resultThird = component.isErrorOnVerification(resultDetailSecond, resultDetailSecond.homeValue);

      expect(result).toBeTruthy();
      expect(resultSecond).toBeFalsy();
      expect(resultThird).toBeFalsy();
    });
  });

  describe('isFinalScoreDisabled', () => {
    it('return false when result is final and checked score direct', () => {
      component.isScoreDirect = true;

      const result = component.isFinalScoreDisabled(ResourcesIds.fullTime);

      expect(result).toBeFalsy();
    });
    it('return true when result is normal and checked score direct', () => {
      component.isScoreDirect = true;

      const result = component.isFinalScoreDisabled("1Q");

      expect(result).toBeTruthy();
    });
  });

  describe('changeScore', () => {
    it('should check consistent when change score final', () => {
      component.isScoreDirect = true;
      component.matchDetail = matchDetail;
      spyOn(halfTimeFullTimeService, 'sumScore');
      spyOn(verificationService, 'isScoreFTInconsistent');
      spyOn(verificationService, 'isScoreMismatched');

      component.changeScore();

      expect(halfTimeFullTimeService.sumScore).toHaveBeenCalled();
      expect(verificationService.isScoreFTInconsistent).toHaveBeenCalled();
    });

    it('should auto sum score set for final when change score', () => {
      component.isScoreDirect = false;
      component.matchDetail = matchDetail;
      const resultDetail = new ResultDetail();
      resultDetail.homeValue = "1";
      resultDetail.awayValue = "1";
      component.resultDetails = [fullTime];
      component.isScoreFTInconsistent = true;
      spyOn(halfTimeFullTimeService, 'sumScore').and.returnValue(resultDetail);
      spyOn(verificationService, 'isScoreMismatched');

      component.changeScore();

      expect(component.isScoreFTInconsistent).toBeFalsy();
      expect(fullTime.homeValue).toEqual("1");
      expect(fullTime.awayValue).toEqual("1");
    });
  });

  describe('halftimeTicketStatusBackground - fullTimeTicketStatusBackground', () => {
    it('should return calculated background when status is calculated', () => {
      matchDetail.htStatus = 'Calculated';
      component.matchDetail = matchDetail;

      expect(component.halftimeTicketStatusBackground).toEqual('bg-calculated');
    });

    it('should return marked background when status is marked', () => {
      matchDetail.htStatus = 'Marked';
      component.matchDetail = matchDetail;

      expect(component.halftimeTicketStatusBackground).toEqual('bg-marked');
    });
  });

  describe('calculateHalfTime', () => {
    it('should show error when score halfTime not valid', () => {
      component.matchDetail = matchDetail;
      spyOn(toastrService, 'clear');
      spyOn(toastrService, 'error');
      spyOn(verificationService, 'verifyHalfTimeScore').and.returnValue(true);

      component.calculateHalfTime();

      expect(toastrService.error).toHaveBeenCalledWith(Language.warningInputScore);
      expect(toastrService.clear).toHaveBeenCalled();
      expect(component.clickCalcHalfTime).toBeTruthy();
    });

    it('should show error when score halfTime inconsistent', () => {
      component.matchDetail = matchDetail;
      component.isScoreHTInconsistent = true;
      spyOn(toastrService, 'error');
      spyOn(verificationService, 'verifyHalfTimeScore').and.returnValue(false);

      component.calculateHalfTime();

      expect(toastrService.error).toHaveBeenCalledWith(Language.inconsistentValues);
    });

    it('should show error when score Insufficient and user is member', () => {
      component.matchDetail = matchDetail;
      component.isScoreHTInconsistent = false;
      permission.isLeader = false;
      component.permission = permission;
      spyOn(toastrService, 'error');
      spyOn(verificationService, 'verifyHalfTimeScore').and.returnValue(false);
      spyOn(verificationService, 'isSourceSufficient').and.returnValue(false);
      spyOn(verificationService, 'isConsistent').and.returnValue(true);

      component.calculateHalfTime();

      expect(toastrService.error).toHaveBeenCalledWith(Language.otherSports.warningCalculateInconsistent);
    });

    it('should show confirm when score Insufficient and user is leader', () => {
      component.matchDetail = matchDetail;
      component.isScoreHTInconsistent = false;
      permission.isLeader = true;
      component.permission = permission;
      spyOn(messageBoxService, 'confirm');
      spyOn(verificationService, 'verifyHalfTimeScore').and.returnValue(false);
      spyOn(verificationService, 'isSourceSufficient').and.returnValue(false);
      spyOn(verificationService, 'isConsistent').and.returnValue(true);

      component.calculateHalfTime();

      expect(messageBoxService.confirm).toHaveBeenCalled();
    });

    it('should show confirm when score changed ', fakeAsync(() => {
      component.matchDetail = matchDetail;
      component.isScoreHTInconsistent = false;
      spyOn(verificationService, 'verifyHalfTimeScore').and.returnValue(false);
      spyOn(verificationService, 'isSourceSufficient').and.returnValue(true);
      spyOn(verificationService, 'isConsistent').and.returnValue(false);
      spyOn(verificationService, 'VerifyChangedSettledTickets').and.returnValue(of(true));

      component.calculateHalfTime();
      tick();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(component.isReSettledTickets).toBeTruthy();
    }));

    it('should call api calc after pass all validation and two confirm box', fakeAsync(() => {
      component.matchDetail = matchDetail;
      component.isScoreHTInconsistent = false;
      spyOn(verificationService, 'verifyHalfTimeScore').and.returnValue(false);
      spyOn(verificationService, 'isSourceSufficient').and.returnValue(true);
      spyOn(verificationService, 'isConsistent').and.returnValue(false);
      spyOn(verificationService, 'VerifyChangedSettledTickets').and.returnValue(of(false));
      spyOn(requestService, 'calculate').and.returnValue(of(successfulResult));
      spyOn(closePopupService, 'closePopup');

      component.calculateHalfTime();
      tick();
      let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();
      buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(requestService.calculate).toHaveBeenCalled();
      expect(closePopupService.closePopup).toHaveBeenCalled();
    }));

    it('should show error when calculate fail', fakeAsync(() => {
      component.matchDetail = matchDetail;
      component.isScoreHTInconsistent = false;
      spyOn(verificationService, 'verifyHalfTimeScore').and.returnValue(false);
      spyOn(verificationService, 'isSourceSufficient').and.returnValue(true);
      spyOn(verificationService, 'isConsistent').and.returnValue(false);
      spyOn(verificationService, 'VerifyChangedSettledTickets').and.returnValue(of(false));
      spyOn(requestService, 'calculate').and.returnValue(of(unSuccessfulResult));
      spyOn(toastrService, 'error');

      component.calculateHalfTime();
      tick();
      let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();
      buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(requestService.calculate).toHaveBeenCalled();
      expect(toastrService.error).toHaveBeenCalledWith(unSuccessfulResult.errMsg);
    }));
  });

  describe('calculateFullTime', () => {
    it('should show error when score not valid', () => {
      component.matchDetail = matchDetail;
      spyOn(toastrService, 'clear');
      spyOn(toastrService, 'error');
      spyOn(verificationService, 'verifyAllScore').and.returnValue(true);

      component.calculateFullTime();

      expect(toastrService.error).toHaveBeenCalledWith(Language.warningInputScore);
      expect(toastrService.clear).toHaveBeenCalled();
      expect(component.clickCalcFullTime).toBeTruthy();
    });

    it('should show error when score inconsistent', () => {
      component.matchDetail = matchDetail;
      component.isScoreFTInconsistent = true;
      spyOn(toastrService, 'error');
      spyOn(verificationService, 'verifyAllScore').and.returnValue(false);

      component.calculateFullTime();

      expect(toastrService.error).toHaveBeenCalledWith(Language.inconsistentValues);
    });
  });

  describe('calculateAll', () => {
    it('should show error when score not valid', () => {
      component.matchDetail = matchDetail;
      spyOn(toastrService, 'clear');
      spyOn(toastrService, 'error');
      spyOn(verificationService, 'verifyAllScore').and.returnValue(true);

      component.calculateAll();

      expect(toastrService.error).toHaveBeenCalledWith(Language.warningInputScore);
      expect(toastrService.clear).toHaveBeenCalled();
      expect(component.clickCalcFullTime).toBeTruthy();
    });

    it('should show error when score inconsistent', () => {
      component.matchDetail = matchDetail;
      component.isScoreHTInconsistent = true;
      spyOn(toastrService, 'error');
      spyOn(verificationService, 'verifyAllScore').and.returnValue(false);

      component.calculateAll();

      expect(toastrService.error).toHaveBeenCalledWith(Language.inconsistentValues);
    });
  });
  it('unCalculate - should call api calculate after pass 2 confirm box', fakeAsync(() => {
    component.matchDetail = matchDetail;
    spyOn(requestService, 'calculate').and.returnValue(of(successfulResult));
    spyOn(closePopupService, 'closePopup');

    component.unCalculate();
    tick();
    let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
    buttonYes.click();
    tick();
    buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
    buttonYes.click();
    tick();

    expect(requestService.calculate).toHaveBeenCalled();
    expect(closePopupService.closePopup).toHaveBeenCalled();
  }));

   describe('getConfirmedBackground', () => {
    it('always call function check confirmed with fulltime', () =>{
      component.hasHalfTime = false;
      halfTime.className = "";
      component.resultDetails = [halfTime, fullTime];
      spyOn(halfTimeFullTimeService, 'fullTimeConfirmed').and.returnValue(true);
      spyOn(halfTimeFullTimeService, 'halfTimeConfirmed')

      component.getConfirmedBackground();

      expect(fullTime.className).toEqual('bg-result-confirmed ');
      expect(halfTime.className).toEqual("");
      expect(halfTimeFullTimeService.halfTimeConfirmed).not.toHaveBeenCalled();
      expect(halfTimeFullTimeService.fullTimeConfirmed).toHaveBeenCalled();
    });

    it('call function check confirmed for both ht-ft when halftime exist', () =>{
      component.hasHalfTime = true;
      component.resultDetails = [halfTime, fullTime];
      spyOn(halfTimeFullTimeService, 'fullTimeConfirmed').and.returnValue(true);
      spyOn(halfTimeFullTimeService, 'halfTimeConfirmed').and.returnValue(false)

      component.getConfirmedBackground();

      expect(fullTime.className).toEqual('bg-result-confirmed ');
      expect(halfTime.className).toEqual('');
      expect(halfTimeFullTimeService.halfTimeConfirmed).toHaveBeenCalled();
    });
   });
});
