import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick, flush } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastContainerDirective, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { ResourceHeaderPipe, ResourceNameByIdPipe, ResultPipe, ScorePipe } from '../../pipes';
import { RequestService } from '../../services/request.service';
import { ModalContentDialogComponent } from '../../../shared/components/modal-dialog/modal-content-dialog.component';
import { ModalDialogComponent } from '../../../shared/components/modal-dialog/modal-dialog.component';
import { NotReadyMatchComponent } from '../../../shared/components/not-ready-match/not-ready-match.component';
import { ResettleCheckerComponent } from '../../../shared/components/resettle-checker/resettle-checker.component';
import { TicketCountComponent } from '../../../shared/components/ticket-count/ticket-count.component';
import { IntervalBackgroundPipe } from '../../../shared/pipes/interval-background.pipe';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../../shared/services';

import { GameTotalMatchCalculationComponent } from './game-total-match-calculation.component';
import { GameTotalMatchVerificationService } from './game-total-match-verification.service';
import { GameTotalMatchService } from './game-total-match.service';
import { Match, MatchDetail, OtherSportsMatch, Permission } from '../../models';
import { HedgeMatchDetail } from '../../../shared/models/sportsbook-sop';
import { of } from 'rxjs';
import { ResultDetail } from '../../../shared/models/sportsbook-sop';
import { ResourcesIds } from '../../constants/resource-ids.native';
import * as _ from 'lodash';

describe('GameTotalMatchCalculationComponent', () => {
  let component: GameTotalMatchCalculationComponent;
  let fixture: ComponentFixture<GameTotalMatchCalculationComponent>;
  let requestService: RequestService;
  let gameTotalMatchService: GameTotalMatchService;
  let verificationService: GameTotalMatchVerificationService;
  let messageBoxService : MessageBoxService;
  let toastrService: ToastrService;
  const permission = {
    isLeader: true,
  } as Permission;
  const buttonName = "btn-danger";
  const errorMessage = "error";
  const successfulResult = {
    errCode: 0,
    errMsg: null,
    isSuccessful: true,
    childMatchIds: "",
    settledSessionId: "",
    hasResultAmendment: false,
    isOrg: false,
};

const unsuccessfulResult = {
    errCode: 1,
    errMsg: errorMessage,
    isSuccessful: false,
    childMatchIds: "",
    settledSessionId: "",
    hasResultAmendment: false,
    isOrg: false,
};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        GameTotalMatchCalculationComponent,
        ResourceHeaderPipe,
        ScorePipe,
        ResultPipe,
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
        NotReadyMatchComponent,
        IntervalBackgroundPipe
      ],
      providers: [
        MessageBoxService,
        GameTotalMatchService,
        GameTotalMatchVerificationService,
        BlockUIService,
        HttpRequestService,
        RequestService,
        IntervalBackgroundPipe,
        ResourceNameByIdPipe,
        NgbModal,
        ToastContainerDirective,
        { provide: ToastrService, useClass: ToastrService },
        { provide: MessageBoxService, useClass: MessageBoxService },
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameTotalMatchCalculationComponent);
    component = fixture.componentInstance;
    verificationService = fixture.debugElement.injector.get(GameTotalMatchVerificationService);
    gameTotalMatchService = fixture.debugElement.injector.get(GameTotalMatchService);
    requestService = fixture.debugElement.injector.get(RequestService);
    messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
    toastrService = fixture.debugElement.injector.get(ToastrService);
    jest.spyOn(toastrService, 'clear');
    jest.spyOn(toastrService, 'error');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getMatch - should call services to get info and set components properties', async () => {
    const matchDetail = {} as MatchDetail;
    matchDetail.matchId = 12345;
    const hedgeMatchDetail = {} as HedgeMatchDetail;
    hedgeMatchDetail.matchId = 54321;
    const match: Match = { matchDetail, hedgeMatchDetail, resultDetails: [], ticketCount: null};
    const otherSportsMatch = {match, permission} as OtherSportsMatch;
    jest.spyOn(requestService, 'getMatch').mockResolvedValue(otherSportsMatch);
    jest.spyOn(gameTotalMatchService, 'resetHomeAway').mockReturnValue();
    jest.spyOn(gameTotalMatchService, 'isReadyMatch').mockReturnValue(true);
    jest.spyOn(gameTotalMatchService, 'getResultDetail').mockReturnValue([new ResultDetail()]);
    jest.spyOn(verificationService, 'isScoreMismatched').mockReturnValue();

    await component.getMatch(12345);

    expect(requestService.getMatch).toHaveBeenCalled();
    expect(gameTotalMatchService.resetHomeAway).toHaveBeenCalled();
    expect(gameTotalMatchService.isReadyMatch).toHaveBeenCalled();
    expect(gameTotalMatchService.getResultDetail).toHaveBeenCalled();
    expect(verificationService.isScoreMismatched).toHaveBeenCalled();
    expect(component.matchDetail.matchId).toEqual(12345);
    expect(component.permission).toEqual(permission);
    expect(component.resultDetails).toEqual([new ResultDetail()]);
    expect(component.hedgeMatchDetail).toEqual(hedgeMatchDetail);
    expect(component.isReadyMatch).toBe(true);
  });

  describe('externalSourceName', () => {
    it('should return dash when source name is null', () => {
      const matchDetail = {} as MatchDetail;
      component.matchDetail = matchDetail;

      const result = component.externalSourceName;

      expect(result).toEqual('-');
    });

    it('should return external source name', () => {
      const matchDetail = { externalSourceName: 'SBO' } as MatchDetail;
      component.matchDetail = matchDetail;

      const result = component.externalSourceName;

      expect(result).toEqual('SBO');
    });
  });

  describe('isScoreConfirmed', () => {
    it('should return true when total set is confirmed', () => {
      const matchDetail = {} as MatchDetail;
      component.matchDetail = matchDetail;
      jest.spyOn(verificationService,'isScoreConfirmed').mockReturnValue(true);

      const result = component.isScoreConfirmed(true);

      expect(result).toBe(true);
    });

    it('should return false when not total set', () => {
      const matchDetail = {} as MatchDetail;
      component.matchDetail = matchDetail;
      jest.spyOn(verificationService,'isScoreConfirmed').mockReturnValue(true);

      const result = component.isScoreConfirmed(false);

      expect(result).toBe(false);
    });

    it('should return false when total set is calculated', () => {
      const matchDetail = { isCalculated: true } as MatchDetail;
      component.matchDetail = matchDetail;
      jest.spyOn(verificationService,'isScoreConfirmed').mockReturnValue(true);

      const result = component.isScoreConfirmed(true);

      expect(result).toBe(false);
    });

    it('should return false when total set is refunded', () => {
      const matchDetail = { isCalRefund: true } as MatchDetail;
      component.matchDetail = matchDetail;
      jest.spyOn(verificationService,'isScoreConfirmed').mockReturnValue(true);

      const result = component.isScoreConfirmed(true);

      expect(result).toBe(false);
    });

    it('should return false when total set is not confirmed', () => {
      const matchDetail = {  } as MatchDetail;
      component.matchDetail = matchDetail;
      jest.spyOn(verificationService,'isScoreConfirmed').mockReturnValue(false);

      const result = component.isScoreConfirmed(true);

      expect(result).toBe(false);
    });
  });

  describe('isScoreMismatched', () => {
    const total = new ResultDetail();
    it('should return true when score mismatched', () => {
      total.isScoreMismatched = true;

      expect(component.isScoreMismatched(total, true)).toBe(true);
    });

    it('should return false when score not final', () => {
      expect(component.isScoreMismatched(total, false)).toBe(false);
    });

    it('should return false when score matched', () => {
      total.isScoreMismatched = false;

      expect(component.isScoreMismatched(total, true)).toBe(false);
    });
  });

  describe('disableTextBox', () => {
    it('should return true when score directly and resource is not total set', () => {
      component.isScoreDirect = true;

      expect(component.disableTextBox('1')).toBe(true);
    });

    it('should return false when score directly and resource is total set', () => {
      component.isScoreDirect = true;

      expect(component.disableTextBox('00')).toBe(false);
    });

    it('should return true when score not directly and resource is total set', () => {
      component.isScoreDirect = false;

      expect(component.disableTextBox('00')).toBe(true);
    });

    it('should return false when score not directly and resource is not total set', () => {
      component.isScoreDirect = false;

      expect(component.disableTextBox('1')).toBe(false);
    });
  });

  it('changeScore - should compute total score and verify score', () => {
    component.isScoreDirect = false;
    jest.spyOn(gameTotalMatchService, 'sumTotalPoints').mockReturnValue();
    jest.spyOn(gameTotalMatchService, 'computeTotalSets').mockReturnValue();
    jest.spyOn(verificationService, 'isNotConsistentTotalSet').mockReturnValue(false);
    jest.spyOn(verificationService, 'isScoreMismatched').mockReturnValue();

    component.changeScore();

    expect(gameTotalMatchService.computeTotalSets).toHaveBeenCalled();
    expect(verificationService.isScoreMismatched).toHaveBeenCalled();
  });

  describe('isErrorOnVerification', () => {
    const resultDetail = new ResultDetail();
    const match = new Match();
    it('should return false when match click on calculate is false', () => {
        component.clickCalcFullTime = false;
        component.match = match;

        const result = component.isErrorOnVerification(resultDetail);

        expect(result).toBeFalsy();
    });

    it('should return false when result is total point', () => {
        component.match = match;
        resultDetail.resourceId = ResourcesIds.totalPoints;

        const result = component.isErrorOnVerification(resultDetail);

        expect(result).toBeFalsy();
    });

    it('should return false when input directly is uncheck and result is total set', () => {
        resultDetail.resourceId = ResourcesIds.totalSets;
        component.clickCalcFullTime = true;
        component.isScoreDirect = false;
        component.match = match;

        const result = component.isErrorOnVerification(resultDetail);

        expect(result).toBeFalsy();
    });

    it('should return false when result has value', () => {
        resultDetail.resourceId = '0101';
        resultDetail.homeValue = '1';
        resultDetail.awayValue = '1';
        component.clickCalcFullTime = true;
        component.isScoreDirect = false;
        component.match = match;

        const result = component.isErrorOnVerification(resultDetail);

        expect(result).toBeFalsy();
    });

    it('should return false when result value is empty', () => {
        resultDetail.resourceId = '0101';
        resultDetail.homeValue = '';
        resultDetail.awayValue = '1';
        component.clickCalcFullTime = true;
        component.isScoreDirect = false;
        component.match = match;

        const result = component.isErrorOnVerification(resultDetail);

        expect(result).toBeTruthy();
    });
  });

  it('changeInputDirectly - should set correct when check input directly', () => {
    const resultDetail = new ResultDetail();
    const totalSet = { resourceId: '00', homeValue: '1', awayValue: '0', originalHomeValue: '2', originalAwayValue: '1' } as ResultDetail;
    const match = new Match();
    resultDetail.homeValue = '1';
    resultDetail.awayValue = '2';
    component.resultDetails = [resultDetail, totalSet];
    component.isScoreDirect = true;

    jest.spyOn(verificationService, 'isScoreMismatched').mockReturnValue();
    jest.spyOn(verificationService, 'isNotConsistentTotalSet').mockReturnValue(true);

    component.changeInputDirectly();

    expect(resultDetail.homeValue).toEqual("");
    expect(resultDetail.awayValue).toEqual("");
    expect(totalSet.awayValue).toEqual('1');
    expect(totalSet.homeValue).toEqual('2');
    expect(component.isScoreInconsistent).toBe(true);
  });

  it('onResettleCheckboxChange - should set resettle flag', () => {
    component.onResettleCheckboxChange(true);

    expect(component.isReSettledTickets).toBe(true);
  });

  describe('copyScore', () => {
    it('should show error when fail to verify copy score', () => {
      jest.spyOn(verificationService, 'verifyCopyScore').mockReturnValue('error');

      component.copyScore();

      expect(toastrService.error).toHaveBeenCalledWith('error');
    });

    it('should copy score when verify successfully', fakeAsync(() => {
      const totalSet = { resourceId: '00'} as ResultDetail;
      const matchDetail = { exFTHomeScore: 2, exFTAwayScore: 3 } as MatchDetail;
      component.resultDetails = [totalSet];
      component.matchDetail = matchDetail;
      jest.spyOn(verificationService, 'verifyCopyScore').mockReturnValue('');

      component.copyScore();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(totalSet.homeValue).toEqual('2');
      expect(totalSet.awayValue).toEqual('3');
    }));
  });

  describe('calculation', () => {
    let set1: ResultDetail;
    let set2: ResultDetail;
    let totalSets: ResultDetail;
    let match: Match;
    let matchDetail: MatchDetail;
    let resultDetails = [];
    beforeEach(() => {
      set1 = { resourceId: '1', homeValue: '1', awayValue: '0' } as ResultDetail;
      set2 = { resourceId: '2', homeValue: '3', awayValue: '2' } as ResultDetail;
      totalSets = { resourceId: '00', homeValue: '2', awayValue: '0' } as ResultDetail;
      resultDetails = [set1, set2, totalSets];
      match = new Match();
      matchDetail = { matchId: 12345 } as MatchDetail;
      component.resultDetails = resultDetails;
      permission.isLeader = true;
      component.permission = permission;
      component.match = match;
      component.matchDetail = matchDetail;
    });

    it('should calculate successfully when all verifications passed', fakeAsync(() => {
      jest.spyOn(verificationService, 'getResultDetailInAction').mockReturnValue(resultDetails);
      jest.spyOn(verificationService, 'isScoreInvalid').mockReturnValue('');
      jest.spyOn(verificationService, 'isScoreConfirmed').mockReturnValue(true);
      jest.spyOn(verificationService, 'verifyChangedSettledTickets').mockResolvedValue(false);
      jest.spyOn(requestService, 'sendRequest').mockResolvedValue(successfulResult);
      jest.spyOn(messageBoxService, 'closePopup');

      component.calculation();
      tick();
      let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();
      buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(messageBoxService.closePopup).toHaveBeenCalled();
    }));

    it('should show error when calculate unsuccessfully though all verification passed', fakeAsync(() => {
      component.isReSettledTickets = true;
      component.applyHedgeMatch = true;
      match.hedgeMatchDetail = { matchId: 54321 } as HedgeMatchDetail;
      jest.spyOn(verificationService, 'getResultDetailInAction').mockReturnValue(resultDetails);
      jest.spyOn(verificationService, 'isScoreInvalid').mockReturnValue('');
      jest.spyOn(verificationService, 'isScoreConfirmed').mockReturnValue(true);
      jest.spyOn(requestService, 'sendRequest').mockResolvedValue(unsuccessfulResult);
      jest.spyOn(messageBoxService, 'closePopup');

      component.calculation();
      tick();
      let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();
      buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
      flush();
    }));

    it('should confirm 3 times and calculate successfully when leader try to calculate insuffucient score', fakeAsync(() => {
      jest.spyOn(verificationService, 'getResultDetailInAction').mockReturnValue(resultDetails);
      jest.spyOn(verificationService, 'isScoreInvalid').mockReturnValue('');
      jest.spyOn(verificationService, 'isScoreConfirmed').mockReturnValue(false);
      jest.spyOn(verificationService, 'isScoreEmpty').mockReturnValue(true)
      jest.spyOn(verificationService, 'verifyChangedSettledTickets').mockResolvedValue(false);
      jest.spyOn(requestService, 'sendRequest').mockResolvedValue(successfulResult);
      jest.spyOn(messageBoxService, 'closePopup');

      component.calculation();
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

    it('should confirm 3 times and calculate successfully when leader try to calculate mismatched score', fakeAsync(() => {
      totalSets.isScoreMismatched = true;
      jest.spyOn(verificationService, 'getResultDetailInAction').mockReturnValue(resultDetails);
      jest.spyOn(verificationService, 'isScoreInvalid').mockReturnValue('');
      jest.spyOn(verificationService, 'isScoreConfirmed').mockReturnValue(true);
      jest.spyOn(verificationService, 'verifyChangedSettledTickets').mockResolvedValue(false);
      jest.spyOn(requestService, 'sendRequest').mockResolvedValue(successfulResult);
      jest.spyOn(messageBoxService, 'closePopup');

      component.calculation();
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

    it('should show error when score is invalid', () => {
      jest.spyOn(verificationService, 'getResultDetailInAction').mockReturnValue(resultDetails);
      jest.spyOn(verificationService, 'isScoreInvalid').mockReturnValue(errorMessage);

      component.calculation();

      expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
    });

    it('should show error when member try to calculate mismatched score', () => {
      totalSets.isScoreMismatched = true;
      permission.isLeader = false;
      jest.spyOn(verificationService, 'getResultDetailInAction').mockReturnValue(resultDetails);
      jest.spyOn(verificationService, 'isScoreInvalid').mockReturnValue('');
      jest.spyOn(verificationService, 'isScoreConfirmed').mockReturnValue(true);

      component.calculation();

      expect(toastrService.error).toHaveBeenCalledWith("WARNING! Insufficient or inconsistent score sources. Please check and try again");
    });

    it('should set resettle flag when trying to calculate settled tickets', fakeAsync(() => {
      jest.spyOn(verificationService, 'getResultDetailInAction').mockReturnValue(resultDetails);
      jest.spyOn(verificationService, 'isScoreInvalid').mockReturnValue('');
      jest.spyOn(verificationService, 'isScoreConfirmed').mockReturnValue(true);
      jest.spyOn(verificationService, 'verifyChangedSettledTickets').mockResolvedValue(true);

      component.calculation();
      tick();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(component.isReSettledTickets).toBe(true);
    }));
  });

  it('uncalculate - should confirm twice and push successfully', fakeAsync(() => {
    const match = new Match();
    const matchDetail = { matchId: 12345 } as MatchDetail;
    component.match = match;
    component.matchDetail = matchDetail;
    jest.spyOn(verificationService, 'getResultDetailInAction').mockReturnValue([]);
    jest.spyOn(requestService, 'sendRequest').mockResolvedValue(successfulResult);
    jest.spyOn(messageBoxService, 'closePopup');

    component.uncalculate();
    tick();
    let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
    buttonYes.click();
    tick();
    buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
    buttonYes.click();
    tick();

    expect(messageBoxService.closePopup).toHaveBeenCalled();
  }));
});
