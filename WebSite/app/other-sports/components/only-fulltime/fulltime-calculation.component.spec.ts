import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick, flush } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FullTimeVerificationService } from './fulltime-verification.service';
import { ModalContentDialogComponent } from '../../../shared/components/modal-dialog/modal-content-dialog.component';
import { ModalDialogComponent } from '../../../shared/components/modal-dialog/modal-dialog.component';
import { NotReadyMatchComponent } from '../../../shared/components/not-ready-match/not-ready-match.component';
import { ResettleCheckerComponent } from '../../../shared/components/resettle-checker/resettle-checker.component';
import { TicketCountComponent } from '../../../shared/components/ticket-count/ticket-count.component';
import { FullTimeCalculationComponent } from './fulltime-calculation.component';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../../shared/services';
import { FormsModule } from '@angular/forms';
import { Match, MatchDetail, OtherSportsMatch, Permission, QueryMatch } from '../../models';
import { TicketCount } from '../../../shared/models';
import { Language } from '../../../shared/language.native';
import { ScorePipe } from '../../pipes';
import { RequestService } from '../..//services/request.service';
import { FullTimeService } from './fulltime.service';
import { MappedScoreService } from './mapped-score.service';
import { ToastContainerDirective, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';

describe('FullTimeCalculationComponent', () => {
  let component: FullTimeCalculationComponent;
  let fixture: ComponentFixture<FullTimeCalculationComponent>;
  let requestService: RequestService;
  let messageBoxService: MessageBoxService;
  let verificationService: FullTimeVerificationService;
  let toastrService: ToastrService;
  let mappedScoreService: MappedScoreService;

  const ticketCount: TicketCount = {
    groupId: 0,
    groupName: null,
    betRunningCount: 0,
    betMarkedCount: 0,
    betSettledCount: 0,
  };
  const matchDetail = {} as MatchDetail;
  matchDetail.sportType = 44;
  matchDetail.matchId = 123;
  matchDetail.sportName = 'test';
  matchDetail.matchCode = 'abc';
  matchDetail.playTime = 1;
  matchDetail.isUnCalculate = true;
  matchDetail.isFullTimeSettled = false;
  matchDetail.isHalfTimeSettled = false;
  matchDetail.confirmHT = 0;
  matchDetail.confirmFT = 0;
  matchDetail.externalSourceName = 'SBO';

  const permission: Permission = {
    canCalculate: true,
    canRefund: true,
    canUncalculate: true,
    isLeader: false,
  }

  const match: Match = {
    ticketCount: [ticketCount],
    matchDetail,
    hedgeMatchDetail: null,
    resultDetails: [],

  }

  const otherSportsMatch: OtherSportsMatch = {
    match,
    permission,
  }

  const successfulResult = {
    errCode: 0,
    errMsg: "",
    isSuccessful: true,
  };

  const unsuccessfulResult = {
    errCode: 1,
    errMsg: "abc",
    isSuccessful: false,
  };

  const buttonName = "btn-danger";

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        FullTimeCalculationComponent,
        ScorePipe,
      ],
              imports: [
          HttpClientModule,
          NgbModule,
          FormsModule,
          ToastNoAnimationModule.forRoot(),
          ToastrModule.forRoot(),
          ModalDialogComponent,
          ModalContentDialogComponent,
          TicketCountComponent,
          ResettleCheckerComponent,
          NotReadyMatchComponent,
          NoopAnimationsModule
        ],
      providers: [
        RequestService,
        BlockUIService,
        HttpRequestService,
        FullTimeService,
        FullTimeVerificationService,
        MappedScoreService,
        NgbModal,
        ToastContainerDirective,
        { provide: ToastrService, useClass: ToastrService },
        { provide: MessageBoxService, useClass: MessageBoxService },
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FullTimeCalculationComponent);
    component = fixture.componentInstance;
    requestService = fixture.debugElement.injector.get(RequestService);
    messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
    verificationService = fixture.debugElement.injector.get(FullTimeVerificationService);
    toastrService = fixture.debugElement.injector.get(ToastrService);
    mappedScoreService = fixture.debugElement.injector.get(MappedScoreService);
    fixture.detectChanges();
    jest.spyOn(messageBoxService, 'closePopup').mockImplementation(() => { });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getMatch', () => {
    it('getMatch - should call getMatch function with correct param', () => {
      const matchId = 123;
      const query = new QueryMatch(matchId, false);
      jest.spyOn(requestService, 'getMatch').mockResolvedValue(otherSportsMatch);
      component.getMatch(matchId);

      expect(requestService.getMatch).toHaveBeenCalledWith(query);
    });

    it("should reset score when bet status is 'Refund'", async () => {
      const matchId = 123;
      match.matchDetail.finalHomeScore = 1;
      match.matchDetail.finalAwayScore = null;
      otherSportsMatch.match.matchDetail.betStatus = 'Refund;';
      jest.spyOn(requestService, 'getMatch').mockResolvedValue(otherSportsMatch);

      await component.getMatch(matchId);

      expect(component.matchDetail.finalAwayScore).toEqual(null);
      expect(component.matchDetail.finalHomeScore).toEqual(null);
      expect(component.matchDetail.betStatus).toEqual('');
    });

    it("should set score when permission is leader", async () => {
      const matchId = 123;
      match.matchDetail.finalHomeScore = 1;
      match.matchDetail.finalAwayScore = 2;
      permission.isLeader = true;
      otherSportsMatch.match.matchDetail.betStatus = '';
      jest.spyOn(requestService, 'getMatch').mockResolvedValue(otherSportsMatch);

      await component.getMatch(matchId);

      expect(component.matchDetail.finalAwayScore).toEqual(2);
      expect(component.matchDetail.finalHomeScore).toEqual(1);
      expect(component.matchDetail.betStatus).toEqual('');
    });
  });

  describe('calculation', () => {
    beforeEach(() => {
      matchDetail.finalAwayScore = 1;
      matchDetail.finalHomeScore = 2;
      component.match = match;
      component.matchDetail = matchDetail;
      component.permission = permission;
      jest.spyOn(toastrService, 'error');
    });

    it('should clear messageError', () => {
      component.isReSettledTickets = true;
      jest.spyOn(toastrService, 'clear');
      jest.spyOn(messageBoxService, 'confirm');
      jest.spyOn(verificationService, 'isScoreSourceInsufficient').mockReturnValue(false);
      jest.spyOn(verificationService, 'isScoreInconsistent').mockReturnValue(false);

      component.calculation();

      expect(toastrService.clear).toHaveBeenCalled();
    });
    it('should set messageError when final score is empty', () => {
      component.isReSettledTickets = true;
      matchDetail.finalAwayScore = null;
      component.matchDetail = matchDetail;
      jest.spyOn(verificationService, 'isScoreSourceInsufficient').mockReturnValue(false);
      jest.spyOn(verificationService, 'isScoreInconsistent').mockReturnValue(false);

      component.calculation();

      expect(toastrService.error).toHaveBeenCalledWith('Please input score accordingly.');
    });

    it('should invoke messageBoxService.confirm when final score is not empty', () => {
      matchDetail.finalHomeScore = 1;
      matchDetail.finalAwayScore = 0;
      matchDetail.sportType = 1; // Not Muay Thai
      component.matchDetail = matchDetail;
      component.isReSettledTickets = true;
      jest.spyOn(messageBoxService, 'confirm');
      jest.spyOn(verificationService, 'isScoreSourceInsufficient').mockReturnValue(false);
      jest.spyOn(verificationService, 'isScoreInconsistent').mockReturnValue(false);

      component.calculation();

      expect(messageBoxService.confirm).toHaveBeenCalled();
      expect(component.confirmationDialogMessage.message).toEqual(Language.CalculationConfirmMessage)
    });

    it('should stop when muay thai score is invalid', () => {
      matchDetail.sportType = 44;
      matchDetail.finalAwayScore = 2;
      matchDetail.finalHomeScore = 1;
      component.matchDetail = matchDetail;
      component.isReSettledTickets = true;
      jest.spyOn(messageBoxService, 'confirm');
      jest.spyOn(verificationService, 'isScoreSourceInsufficient').mockReturnValue(false);
      jest.spyOn(verificationService, 'isScoreInconsistent').mockReturnValue(false);

      component.calculation();

      expect(messageBoxService.confirm).toHaveBeenCalledTimes(0);
      expect(toastrService.error).toHaveBeenCalledWith('Please input the correct Final Score.');
    });

    it('should stop when muay thai ko in round is invalid', () => {
      matchDetail.sportType = 44;
      matchDetail.finalAwayScore = 0;
      matchDetail.finalHomeScore = 1;
      matchDetail.betStatus = '';
      component.matchDetail = matchDetail;
      component.isReSettledTickets = true;
      jest.spyOn(messageBoxService, 'confirm');
      jest.spyOn(verificationService, 'isScoreSourceInsufficient').mockReturnValue(false);
      jest.spyOn(verificationService, 'isScoreInconsistent').mockReturnValue(false);

      component.calculation();

      expect(messageBoxService.confirm).toHaveBeenCalledTimes(0);
      expect(toastrService.error).toHaveBeenCalledWith("Please input the correct 'KO at Round'");
    });

    it('should not show error when settle successful', fakeAsync(async () => {
      matchDetail.finalHomeScore = 1;
      matchDetail.finalAwayScore = 0;
      matchDetail.betStatus = '3'; // Valid bet status for Muay Thai
      component.matchDetail = matchDetail;
      component.matchDetail.sportType = 44;
      
      jest.spyOn(requestService, 'sendRequest').mockResolvedValue(successfulResult as any);
      jest.spyOn(verificationService, 'verifyChangedSettledTickets').mockResolvedValue(false);
      jest.spyOn(verificationService, 'isScoreSourceInsufficient').mockReturnValue(false);
      jest.spyOn(verificationService, 'isScoreInconsistent').mockReturnValue(false);
      jest.spyOn(messageBoxService, 'confirm').mockImplementation((message, callback) => {
        callback();
      });

      await component.calculation();
      tick();

      expect(toastrService.error).not.toHaveBeenCalled();
    }));

    it('should set messageError when settle unsuccessful', fakeAsync(async () => {
      matchDetail.finalHomeScore = 1;
      matchDetail.finalAwayScore = 0;
      matchDetail.sportType = 1; // Not Muay Thai
      component.matchDetail = matchDetail;
      
      jest.spyOn(requestService, 'sendRequest').mockResolvedValue(unsuccessfulResult as any);
      jest.spyOn(verificationService, 'verifyChangedSettledTickets').mockResolvedValue(false);
      jest.spyOn(verificationService, 'isScoreSourceInsufficient').mockReturnValue(false);
      jest.spyOn(verificationService, 'isScoreInconsistent').mockReturnValue(false);
      jest.spyOn(messageBoxService, 'confirm').mockImplementation((message, callback) => {
        callback();
      });

      await component.calculation();
      tick();
      flush();

      expect(toastrService.error).toHaveBeenCalledWith('abc');
    }));

    it('should alert when score inconsistent and user is not leader', fakeAsync(async () => {
      matchDetail.finalHomeScore = 1;
      matchDetail.finalAwayScore = 0;
      matchDetail.sportType = 1; // Not Muay Thai
      component.matchDetail = matchDetail;
      jest.spyOn(verificationService, 'verifyChangedSettledTickets').mockResolvedValue(false);
      jest.spyOn(verificationService, 'isScoreSourceInsufficient').mockReturnValue(false);
      jest.spyOn(verificationService, 'isScoreInconsistent').mockReturnValue(true);
      permission.isLeader = false;

      await component.calculation();
      flush();

      expect(toastrService.error).toHaveBeenCalledWith(Language.otherSports.warningCalculateInconsistent);
    }));

    it('should confirm 1 more time and calculate when score inconsistent and user is leader', fakeAsync(async () => {
      jest.spyOn(requestService, 'sendRequest').mockResolvedValue(successfulResult as any);
      jest.spyOn(verificationService, 'checkScoreMuayThai').mockReturnValue('');
      jest.spyOn(verificationService, 'verifyChangedSettledTickets').mockResolvedValue(false);
      jest.spyOn(verificationService, 'isScoreSourceInsufficient').mockReturnValue(false);
      jest.spyOn(verificationService, 'isScoreInconsistent').mockReturnValue(true);
      permission.isLeader = true;

      await component.calculation();
      let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();
      buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();
      buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).not.toHaveBeenCalled();
    }));
  });

  describe('uncalculation', () => {
    beforeEach(() => {
      component.match = match;
      component.matchDetail = matchDetail;
      jest.spyOn(toastrService, 'error');
    });
    it('should clear messageError and show confirmbox', () => {
      jest.spyOn(messageBoxService, 'confirm');
      jest.spyOn(toastrService, 'clear');

      component.uncalculation();

      expect(toastrService.clear).toHaveBeenCalled();
      expect(messageBoxService.confirm).toHaveBeenCalled();
    });

    it('should call popup when settle successful', fakeAsync(() => {
      jest.spyOn(requestService, 'sendRequest').mockResolvedValue(successfulResult as any);
      jest.spyOn(messageBoxService, 'confirm').mockImplementation((message, callback) => {
        callback();
      });

      component.uncalculation();
      tick();

      expect(messageBoxService.closePopup).toHaveBeenCalled();
    }));

    it('should ser messageError when settle unsuccessful', fakeAsync(() => {
      jest.spyOn(requestService, 'sendRequest').mockResolvedValue(unsuccessfulResult as any);
      jest.spyOn(messageBoxService, 'confirm').mockImplementation((message, callback) => {
        callback();
      });

      component.uncalculation();
      tick();
      flush();

      expect(toastrService.error).toHaveBeenCalledWith('abc');
    }));
  });

  describe('copyScore', () => {
    beforeEach(() => {
      component.match = match;
      component.matchDetail = matchDetail;
      jest.spyOn(toastrService, 'clear');
      jest.spyOn(toastrService, 'error');
      jest.spyOn(messageBoxService, 'confirm');
    });

    it('should clear toastr and show confirmation when verification passes', () => {
      jest.spyOn(verificationService, 'verifyCopyScore').mockReturnValue('');

      component.copyScore();

      expect(toastrService.clear).toHaveBeenCalled();
      expect(messageBoxService.confirm).toHaveBeenCalled();
    });

    it('should show error when verification fails', () => {
      const errorMessage = 'Verification failed';
      jest.spyOn(verificationService, 'verifyCopyScore').mockReturnValue(errorMessage);

      component.copyScore();

      expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
      expect(messageBoxService.confirm).not.toHaveBeenCalled();
    });

    it('should copy regular score when sport type is not Muay Thai', fakeAsync(() => {
      jest.spyOn(verificationService, 'verifyCopyScore').mockReturnValue('');
      matchDetail.sportType = 1; // Not Muay Thai
      matchDetail.exFTHomeScore = 3;
      matchDetail.exFTAwayScore = 4;
      component.matchDetail = matchDetail;
      component.match = match;
      component.match.matchDetail = matchDetail;
      
      jest.spyOn(messageBoxService, 'confirm').mockImplementation((message, callback) => {
        callback();
      });

      component.copyScore();
      tick();

      expect(component.matchDetail.finalHomeScore).toEqual(3);
      expect(component.matchDetail.finalAwayScore).toEqual(4);
    }));

    it('should copy Muay Thai score with mapping when sport type is Muay Thai', fakeAsync(() => {
      jest.spyOn(verificationService, 'verifyCopyScore').mockReturnValue('');
      jest.spyOn(mappedScoreService, 'getMappedScore').mockReturnValue({
        home: 1,
        away: 0,
        round: '3'
      });
      matchDetail.sportType = 44; // Muay Thai
      matchDetail.exFTHomeScore = 3;
      matchDetail.exFTAwayScore = 0;
      component.matchDetail = matchDetail;
      component.match = match;
      component.match.matchDetail = matchDetail;
      
      jest.spyOn(messageBoxService, 'confirm').mockImplementation((message, callback) => {
        callback();
      });

      component.copyScore();
      tick();

      expect(mappedScoreService.getMappedScore).toHaveBeenCalledWith(3, 0);
      expect(component.matchDetail.finalHomeScore).toEqual(1);
      expect(component.matchDetail.finalAwayScore).toEqual(0);
      expect(component.matchDetail.betStatus).toEqual('3');
    }));

    it('should replace provider name in confirmation message', () => {
      jest.spyOn(verificationService, 'verifyCopyScore').mockReturnValue('');
      matchDetail.externalSourceName = 'TestProvider';

      component.copyScore();

      expect(messageBoxService.confirm).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('TestProvider')
        }),
        expect.any(Function)
      );
    });

    it('should use dash when external source name is empty', () => {
      jest.spyOn(verificationService, 'verifyCopyScore').mockReturnValue('');
      matchDetail.externalSourceName = '';

      component.copyScore();

      expect(messageBoxService.confirm).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('-')
        }),
        expect.any(Function)
      );
    });
  });

  it('isFinalScoreConfirmed should call service correctly', () => {
    jest.spyOn(verificationService, 'isFinalScoreConfirmed').mockReturnValue(true);
    component.matchDetail = matchDetail;

    const result = component.isFinalScoreConfirmed();

    expect(result).toBe(true);
  });

  it('isScoreInconsistent should call service correctly', () => {
    jest.spyOn(verificationService, 'isScoreInconsistent').mockReturnValue(true);
    component.matchDetail = matchDetail;

    const result = component.isScoreInconsistent;

    expect(result).toBe(true);
  });

  describe('private methods', () => {
    beforeEach(() => {
      component.match = match;
      component.matchDetail = matchDetail;
    });

    describe('externalSourceName getter', () => {
      it('should return external source name when not empty', () => {
        matchDetail.externalSourceName = 'TestProvider';

        const result = component.externalSourceName;

        expect(result).toBe('TestProvider');
      });

      it('should return dash when external source name is empty', () => {
        matchDetail.externalSourceName = '';

        const result = component.externalSourceName;

        expect(result).toBe('-');
      });

      it('should return dash when external source name is null', () => {
        matchDetail.externalSourceName = null;

        const result = component.externalSourceName;

        expect(result).toBe('-');
      });
    });

    describe('checkPlayTimeBySportType getter', () => {
      it('should check Muay Thai play time correctly', () => {
        matchDetail.sportType = 44; // Muay Thai
        matchDetail.playTime = 90; // Assuming KickOffTime.muayThai = 90

        const result = component['checkPlayTimeBySportType'];

        expect(result).toBe(true);
      });

      it('should check Beach Soccer play time correctly', () => {
        matchDetail.sportType = 61; // Beach Soccer
        matchDetail.playTime = 45; // Assuming KickOffTime.beachSoccer = 45

        const result = component['checkPlayTimeBySportType'];

        expect(result).toBe(true);
      });

      it('should check default play time correctly', () => {
        matchDetail.sportType = 1; // Other sport
        matchDetail.playTime = 30; // Assuming KickOffTime.playTime = 30

        const result = component['checkPlayTimeBySportType'];

        expect(result).toBe(true);
      });
    });

    describe('isCompletedOrConfirmScore getter', () => {
      it('should return true when confirmHT > 0', () => {
        matchDetail.confirmHT = 1;
        matchDetail.confirmFT = 0;
        matchDetail.eventStatus = 'Active';

        const result = component['isCompletedOrConfirmScore'];

        expect(result).toBe(true);
      });

      it('should return true when confirmFT > 0', () => {
        matchDetail.confirmHT = 0;
        matchDetail.confirmFT = 1;
        matchDetail.eventStatus = 'Active';

        const result = component['isCompletedOrConfirmScore'];

        expect(result).toBe(true);
      });

      it('should return true when event status is completed', () => {
        matchDetail.confirmHT = 0;
        matchDetail.confirmFT = 0;
        matchDetail.eventStatus = 'completed';
        component.matchDetail = matchDetail;

        const result = component['isCompletedOrConfirmScore'];

        expect(result).toBe(true);
      });

      it('should return false when none of conditions are met', () => {
        matchDetail.confirmHT = 0;
        matchDetail.confirmFT = 0;
        matchDetail.eventStatus = 'Active';

        const result = component['isCompletedOrConfirmScore'];

        expect(result).toBe(false);
      });
    });
  });
});
