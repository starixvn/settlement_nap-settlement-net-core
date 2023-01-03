import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  LeagueComponent,
} from '.';
import {
  MultiSport,
  MatchWaitingRequest,
  SportMatch,
  LeagueMatch,
  Match
} from '../models';
import { RefreshMatchService, MultiSportService, PopupService, HandleActionsService, DetectChangesService, BackGroundService, SportMatchService } from '../services';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpRequestService, BlockUIService, MessageBoxService, DialogBoxService } from '../../shared/services';
import { SimpleChange, QueryList, ElementRef } from '@angular/core';
import { MaterialModule } from '../../shared/material-module';
import { of } from 'rxjs';
import { ModalDialogComponent, ModalContentDialogComponent } from '../../shared/components';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { IntervalScorePipe } from '../../shared/pipes/interval-score.pipe';
import {
  MoreScore,
  Score,
  MixParlay,
  Remark,
  AutoSetting
} from '../../shared/models';
import { BackgroundColor, SportType } from '../../shared/constants';
import { Permission } from '../../shared/models/sportsbook-sop/permission.model';

describe('LeagueComponent', () => {
  let component: LeagueComponent;
  let fixture: ComponentFixture<LeagueComponent>;
  let refreshMatchService: RefreshMatchService;
  let multiSportService: MultiSportService;
  let messageBoxService: MessageBoxService;
  let sportMatchService: SportMatchService;
  let handleActionsService: HandleActionsService;
  let backGroundService: BackGroundService;
  let popupService: PopupService;
  let match = new Match();
  match.sportType = SportType.eSports;
  match.isCheckedCalcMP = true;
  match.isExistMarkedTicketParlay = false;
  match.autoCalcSetting = new AutoSetting();
  const parlay = new MixParlay();
  parlay.hasMixParlay = true;
  match.mixParlay = parlay;
  const buttonName = "btn-danger";
  const errorMessage = "Error message";
  const league: LeagueMatch = {
    leagueId: 7000000,
    matches: [match],
    name: 'mock league',
    collapse: false,
    isCheckedCalcMP: true,
    disableCheckCalcMP: false,
    isMergedParlay: false,
    isAutoPayoutForLeague: false,
    autoWaitingTime: 0,
    autoCalcSetting: new AutoSetting()
  };

  const sport: SportMatch = {
    id: 100000,
    name: 'mock sport',
    leagues: [league],
    collapse: false,
  };

  const permission = new Permission();
  permission.canCalculateMp = true;
  const multiSport: MultiSport = {
    permission,
    sports: [sport],
    isCheckedCalcMP: false,
  };
  const successfulResult = {
    errCode: 0,
    errMsg: "",
    isSuccessful: true,
  };
  const unsuccessfulResult = {
    errCode: 1,
    errMsg: errorMessage,
    isSuccessful: false,
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        LeagueComponent,
        ModalDialogComponent,
        ModalContentDialogComponent,
        IntervalScorePipe,
      ],
      providers: [
        RefreshMatchService,
        NgbModal,
        HttpRequestService,
        BlockUIService,
        MessageBoxService,
        MultiSportService,
        DialogBoxService,
        PopupService,
        HandleActionsService,
        DetectChangesService,
        SportMatchService,
        BackGroundService,
        SportMatchService
      ],
      imports: [
        FormsModule,
        HttpClientModule,
        NgbModule,
        MaterialModule,
      ],
    })
      .overrideModule(BrowserDynamicTestingModule, {
        set: {
          entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
        },
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeagueComponent);
    component = fixture.componentInstance;
    refreshMatchService = fixture.debugElement.injector.get(RefreshMatchService);
    multiSportService = fixture.debugElement.injector.get(MultiSportService);
    messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
    popupService = fixture.debugElement.injector.get(PopupService);
    handleActionsService = fixture.debugElement.injector.get(HandleActionsService);
    sportMatchService = fixture.debugElement.injector.get(SportMatchService);
    backGroundService = fixture.debugElement.injector.get(BackGroundService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit - should set permission and refresh matches', fakeAsync(() => {
    component.multiSport = multiSport;
    component.sports = multiSport.sports;
    component.enableRefresh = true;
    spyOn(refreshMatchService, 'refreshMatches');

    component.ngOnInit();
    tick(6000);
    component.ngOnDestroy();

    expect(component.permission).toEqual(permission);
    expect(refreshMatchService.refreshMatches).toHaveBeenCalled();
  }));

  it('should set sports and permission when component has changes', () => {
    component.multiSport = multiSport;
    spyOn(sportMatchService, 'getSportsWithIntervalScore');

    component.ngOnChanges({ multiSport: new SimpleChange(null, multiSport, false) });
    fixture.detectChanges();

    expect(sportMatchService.getSportsWithIntervalScore).toHaveBeenCalled();
    expect(component.permission).toEqual(permission);
  });

  describe('isExistedSport', () => {
    it('should return true sports list is not empty', () => {
      component.sports = [sport];
      const result = component.isExistedSport;

      expect(result).toBe(true);
    });

    it('should return undefined when sport list is null', () => {
      const result = component.isExistedSport;

      expect(result).toBe(undefined);
    });

    it('should return false when sports list is empty', () => {
      component.sports = [];

      const result = component.isExistedSport;

      expect(result).toBe(false);
    });
  });

  it('collapseSport - should collapse or uncollapse sport', () => {
    const mockSport = new SportMatch();
    mockSport.collapse = false;

    component.collapseSport(mockSport);

    expect(mockSport.collapse).toBe(true);
  });

  it('collapseLeague - should collapse or uncollapse league', () => {
    const mockLeague = new LeagueMatch();
    mockLeague.collapse = false;

    component.collapseLeague(mockLeague);

    expect(mockLeague.collapse).toBe(true);
  });

  it('selectCalcMPOnSport - should check all leagues and matches', () => {
    component.sports = [sport];
    component.permission = permission;
    component.selectCalcMPOnSport(true);

    expect(league.isCheckedCalcMP).toBe(true);
    expect(match.isCheckedCalcMP).toBe(true);
  });

  it('selectCalcMPOnLeague - should check all matches', () => {
    component.sports = [sport];
    component.multiSport = multiSport;
    permission.canCalculateMp = true;
    component.permission = permission;

    component.selectCalcMPOnLeague(league, true);

    expect(component.multiSport.isCheckedCalcMP).toBe(true);
    expect(match.isCheckedCalcMP).toBe(true);
  });

  it('selectCalcMPOnMatch - should check league and sport when all matches are checked', () => {
    match.isCheckedCalcMP = true;
    component.sports = [sport];
    component.multiSport = multiSport;

    component.selectCalcMPOnMatch(league);

    expect(component.multiSport.isCheckedCalcMP).toBe(true);
    expect(league.isCheckedCalcMP).toBe(true);
  });

  it('selectCalcMPOnLeague - should check all matches except match has mix parlay', () => {
    component.sports = [sport];
    component.multiSport = multiSport;
    match.mixParlay.hasMixParlay = true
    match.isCheckedCalcMP = false;
    permission.canCalculateMp = true;
    component.permission = permission;

    component.selectCalcMPOnLeague(league, true);

    expect(component.multiSport.isCheckedCalcMP).toBe(true);
    expect(match.isCheckedCalcMP).toBe(true);
    match = new Match();
  });

  describe('getCalcColumnColor', () => {
    it('should return background calculated when match is calculated', () => {
      match.isCalculated = true;

      const result = component.getCalcColumnColor(match);

      expect(result).toEqual(BackgroundColor.calculated);
    });

    it('should return background half time calculated when half time is calculated', () => {
      match.isCalculated = false;
      match.isHalfTimeCal = true;

      const result = component.getCalcColumnColor(match);

      expect(result).toEqual(BackgroundColor.halfTimeCalculated);
    });

    it('should return background refund when match is refunded', () => {
      match.isHalfTimeCal = false;
      match.isCalRefund = true;

      const result = component.getCalcColumnColor(match);

      expect(result).toEqual(BackgroundColor.calRefund);
    });
  });

  describe('isShowCalculationLink', () => {
    it('should show calculating link when has permission', () => {
      match.sportType = SportType.eSports;
      const permission = new Permission();
      permission.canCalculate = true;
      component.permission = permission;
      spyOn(backGroundService, 'isShowLink').and.returnValue(true);

      const result = component.isShowCalculationLink(match);

      expect(result).toEqual(BackgroundColor.codeLink);
    });

    it('should show calculating link when has permission trader and sport cricket', () => {
      match.sportType = SportType.cricket;
      const permission = new Permission();
      permission.canCalculate = false;
      permission.isTrader = true;
      component.permission = permission;
      spyOn(backGroundService, 'isShowLink').and.returnValue(true);

      const result = component.isShowCalculationLink(match);

      expect(result).toEqual(BackgroundColor.codeLink);
    });

    it('should hide calculation link when missing permission', () => {
      const permission = new Permission();
      permission.canCalculate = false;
      component.permission = permission;
      spyOn(backGroundService, 'isShowLink').and.returnValue(true);

      const result = component.isShowCalculationLink(match);

      expect(result).toEqual('');
    });

    it('should hide calculation link when failed validation show link', () => {
      const permission = new Permission();
      permission.canCalculate = true;
      component.permission = permission;
      spyOn(backGroundService, 'isShowLink').and.returnValue(false);

      const result = component.isShowCalculationLink(match);

      expect(result).toEqual('');
    });
  });

  describe('isShowRefundLink', () => {
    beforeEach(() => {
      component.request = new MatchWaitingRequest("", "", "", "", "", "123");
    });
    it('should show refund link when has permission refund', () => {
      match.sportType = SportType.eSports;
      const permission = new Permission();
      permission.canRefund = true;
      component.permission = permission;
      spyOn(backGroundService, 'isShowLink').and.returnValue(true);

      const result = component.isShowRefundLink(match);

      expect(result).toEqual(BackgroundColor.codeLink);
    });

    it('should hide refund link when missing permission', () => {
      const permission = new Permission();
      component.permission = permission;
      spyOn(backGroundService, 'isShowLink').and.returnValue(true);

      const result = component.isShowRefundLink(match);

      expect(result).toEqual('');
    });

    it('should hide refund link when failed validation show link', () => {
      const permission = new Permission();
      permission.canCalculate = true;
      component.permission = permission;
      spyOn(backGroundService, 'isShowLink').and.returnValue(false);

      const result = component.isShowRefundLink(match);

      expect(result).toEqual('');
    });

    it('should hide refund link when disable link', () => {
      const permission = new Permission();
      permission.canCalculate = true;
      component.permission = permission;
      component.request = new MatchWaitingRequest("", "", "", "", "", "");
      spyOn(backGroundService, 'isShowLink').and.returnValue(false);

      const result = component.isShowRefundLink(match);

      expect(result).toEqual('');
    });
  });

  describe('isShowEarlySettleLink', () => {
    test.each([
      [true, false, false],
      [false, true, false],
      [false, false, true],
    ])('should show early settle link has permission settle', (canRefund: boolean, canUncalculate: boolean, canCalculate: boolean) => {
      match.showLink = true;
      match.sportType = SportType.eSports;
      const permission = new Permission();
      permission.canCalculate = canUncalculate;
      permission.canUncalculate = canCalculate;
      permission.canRefund = canRefund;
      component.permission = permission;
      spyOn(backGroundService, 'isShowLink').and.returnValue(true);


      const result = component.isShowEarlySettleLink(match);

      expect(result).toEqual(BackgroundColor.codeLink);
    });

    it('should hide refund link when has permission trader and match is cricket', () => {
      const permission = new Permission();
      permission.isTrader = true;
      match.sportType = SportType.cricket;
      component.permission = permission;
      spyOn(backGroundService, 'isShowLink').and.returnValue(true);

      const result = component.isShowEarlySettleLink(match);

      expect(result).toEqual(BackgroundColor.codeLink);
    });

    it('should hide early settle link when validate failed', () => {
      const permission = new Permission();
      permission.canCalculate = true;
      component.permission = permission;
      spyOn(backGroundService, 'isShowLink').and.returnValue(false);

      const result = component.isShowEarlySettleLink(match);

      expect(result).toEqual('');
    });

    it('should hide early settle link when missing permission', () => {
      component.permission = new Permission();
      spyOn(backGroundService, 'isShowLink').and.returnValue(true);

      const result = component.isShowEarlySettleLink(match);

      expect(result).toEqual('');
    });
  });

  describe('getCalcMPColor', () => {
    it('should return background calculated when match is multi calculated', () => {
      match.isMultiCaled = true;
      match.isRefund = false;
      match.isExistMarkedTicketParlay = false;
      match.isExistRunningTicketParlay = false;

      const result = component.getCalcMPColor(match);

      expect(result).toEqual(BackgroundColor.calculated);
    });

    it('should return background refund when match is reafunded', () => {
      match.isMultiCaled = false;
      match.isRefund = true;
      match.isExistMarkedTicketParlay = false;
      match.isExistRunningTicketParlay = false;

      const result = component.getCalcMPColor(match);

      expect(result).toEqual(BackgroundColor.calRefund);
    });

    it('should return background pink when match has running ticket parlay', () => {
      match.isMultiCaled = true;
      match.isRefund = false;
      match.isExistRunningTicketParlay = true;
      match.isExistMarkedTicketParlay = false;

      const result = component.getCalcMPColor(match);

      expect(result).toEqual(BackgroundColor.pink);
    });

    it('should return empty when match is not multi calculated and refunded', () => {
      match.isMultiCaled = false;
      match.isRefund = false;
      match.isExistMarkedTicketParlay = false;
      const result = component.getCalcMPColor(match);

      expect(result).toEqual('');
    });
  });

  describe('canAutoSettlement', () => {
    it('should return true when sport support early settlement', () => {
      const sportType = SportType.badminton;

      const result = component.canAutoSettlement(sportType);

      expect(result).toBe(true);
    });

    it('should return false when sport does not support early settlement', () => {
      const sportType = SportType.baseBall;

      const result = component.canAutoSettlement(sportType);

      expect(result).toBe(false);
    });
  });

  describe('getEarlySettleBackground', () => {
    beforeEach(() => {
      component.request = new MatchWaitingRequest("", "", "", "", "", "");
    });
    it('should return background running when early settle is running', () => {
      match.earlySettleStatus = 'running';
      match.eventStatus = 'completed';

      const result = component.getEarlySettleBackground(match);

      expect(result).toEqual(' bg-auto-settle-running');
    });

    it('should return background blinking when early confirmed, earlyOver and 1 other Over Status option selected.', () => {
      match.isExistsConfirmedEarly = true;
      match.earlySettleStatus = 'running';
      component.request = new MatchWaitingRequest("", "", "", "", "1,3", "");

      const result = component.getEarlySettleBackground(match);

      expect(result).toEqual('bg-green-blinking bg-auto-settle-running');
    });

    it('should return background not blinking when early confirmed but filter only earlyOver', () => {
      match.isExistsConfirmedEarly = true;
      match.earlySettleStatus = 'running';
      component.request = new MatchWaitingRequest("", "", "", "", "1", "");

      const result = component.getEarlySettleBackground(match);

      expect(result).toEqual(' bg-auto-settle-running');
    });

    it('should return background calculated when early settle is completed', () => {
      match.isExistsConfirmedEarly = false;
      match.earlySettleStatus = 'completed';

      const result = component.getEarlySettleBackground(match);

      expect(result).toEqual(' bg-calculated');
    });

    it('should return empty when early settle status is null', () => {
      match.isExistsConfirmedEarly = false;
      match.earlySettleStatus = null;

      const result = component.getEarlySettleBackground(match);

      expect(result).toEqual(' ');
    });
  });

  it('getLog - should call popupService', () => {
    const request = new MatchWaitingRequest('12345', '', '01/01/2020', '01/02/2020',"", "");
    component.request = request;
    spyOn(popupService, 'popupLog');

    component.getLog('12345');

    expect(popupService.popupLog).toHaveBeenCalled();
  });

  describe('getAutoSetting', () => {
    beforeEach(() => {
      match.autoCalcSetting = new AutoSetting();
    });
    it('should return BOTH when match is both auto payout and direct payout', () => {
      match.autoCalcSetting.isAutoPayoutForMatch = true;
      match.autoCalcSetting.isDirectPayoutForMatch = true

      const result = component.getAutoSetting(match.autoCalcSetting);

      expect(result).toEqual("BOTH");
    });

    it('should return AUTO when match only access auto payout', () => {
      match.autoCalcSetting.isAutoPayoutForMatch = true;
      match.autoCalcSetting.isDirectPayoutForMatch = false;

      const result = component.getAutoSetting(match.autoCalcSetting);

      expect(result).toEqual("AUTO");
    });

    it('should return DIRECT when match only access direct payout', () => {
      match.autoCalcSetting.isAutoPayoutForMatch = false;
      match.autoCalcSetting.isDirectPayoutForMatch = true;

      const result = component.getAutoSetting(match.autoCalcSetting);

      expect(result).toEqual("DIRECT");
    });

    it('should return OFF when match when not access auto', () => {
      match.autoCalcSetting.isAutoPayoutForMatch = false;
      match.autoCalcSetting.isDirectPayoutForMatch = false;

      const result = component.getAutoSetting(match.autoCalcSetting);

      expect(result).toEqual("OFF");
    });
  });

  describe('getAutoSettingLeague', () => {
    beforeEach(() => {
      match.autoCalcSetting = new AutoSetting();
    });
    it('should return OFF when league not access auto', () => {
      match.autoCalcSetting.isAutoPayoutForLeague = false;
      match.autoCalcSetting.isDirectPayoutForLeague = false;

      const result = component.getAutoSettingLeague(match.autoCalcSetting);

      expect(result).toEqual("OFF");
    });

    it('should return BOTH when league access both auto type', () => {
      match.autoCalcSetting.isAutoPayoutForLeague = true;
      match.autoCalcSetting.isDirectPayoutForLeague = true;

      const result = component.getAutoSettingLeague(match.autoCalcSetting);

      expect(result).toEqual("BOTH");
    });

    it('should return AUTO when league only access auto payout', () => {
      match.autoCalcSetting.isAutoPayoutForLeague = true;
      match.autoCalcSetting.isDirectPayoutForLeague = false;

      const result = component.getAutoSettingLeague(match.autoCalcSetting);

      expect(result).toEqual("AUTO");
    });

    it('should return DIRECT when league only access direct payout', () => {
      match.autoCalcSetting.isAutoPayoutForLeague = false;
      match.autoCalcSetting.isDirectPayoutForLeague = true;

      const result = component.getAutoSettingLeague(match.autoCalcSetting);

      expect(result).toEqual("DIRECT");
    });
  });

  describe('calculateMixParlay', () => {
    it('should calculate successfully', fakeAsync(() => {
      match.mixParlay = new MixParlay();
      match.mixParlay.hasMixParlay = true;
      match.matchCode = 'ABC';
      permission.canCalculateMp = true;
      component.multiSport = multiSport;
      component.sports = [sport];
      component.sports[0].leagues[0].disableCheckCalcMP = false;
      component.sports[0].leagues[0].isCheckedCalcMP = true;
      component.sports[0].leagues[0].matches[0].isCheckedCalcMP = true;
      component.sports[0].leagues[0].matches[0].isExistMarkedTicketParlay = false;
      component.permission = permission;
      spyOn(multiSportService, 'calculateMixParlay').and.returnValue(of(successfulResult));

      component.calculateMixParlay();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(component.sports[0].leagues[0].matches[0].isCalculatingMP).toEqual(0);
      expect(component.multiSport.isCheckedCalcMP).toBe(false);
      expect(component.sports[0].leagues[0].matches[0].isCheckedCalcMP).toBe(false);

    }));

    it('should return false when no match is checked for calculating', () => {
      component.sports = [sport];
      component.permission = permission;

      const result = component.calculateMixParlay();

      expect(result).toBe(false);
    });

    it('should alert when calculation is not successful', fakeAsync(() => {
      component.multiSport = multiSport;
      component.sports = [sport];
      component.sports[0].leagues[0].disableCheckCalcMP = false;
      component.sports[0].leagues[0].isCheckedCalcMP = true;
      component.sports[0].leagues[0].matches[0].isCheckedCalcMP = true;
      component.permission = permission;
      spyOn(multiSportService, 'calculateMixParlay').and.returnValue(of(unsuccessfulResult));
      spyOn(messageBoxService, 'alert');

      component.calculateMixParlay();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(messageBoxService.alert).toHaveBeenCalled();
    }));
  });

  it('popupCalc - should call popupService when called', () => {
    spyOn(popupService, 'popupCalc');

    component.popupCalc(match);

    expect(popupService.popupCalc).toHaveBeenCalled();
  });

  it('popupRefund - should call popupService', () => {
    spyOn(popupService, 'popupRefund');
    spyOn(component, 'enableCalcMPOnMatch').and.returnValue(false);

    component.popupRefund(match);

    expect(popupService.popupRefund).toHaveBeenCalled();
  });

  it('popupEarly - should call popupService', () => {
    spyOn(popupService, 'popupEarly');

    component.popupEarly(match);

    expect(popupService.popupEarly).toHaveBeenCalled();
  });

  it('disableSelectCalcMPOnLeague - should disable select calc mp on league', () => {
    match.mixParlay.hasMixParlay = false;
    league.matches = [match];
    component.permission = permission;

    const result = component.disableSelectCalcMPOnLeague(league);

    expect(result).toBe(true);
  });

  it('disableSelectAllCalcMP - should disable select all calc mp', () => {
    component.calcMPOnLeague = new QueryList<ElementRef>();

    const result = component.disableSelectAllCalcMP();

    expect(result).toBe(true);
  });

  describe('isChangeSetting', () => {
    it('should return true when having permission and match is not calculating', () => {
      match.isCalculatingSingle = null;
      match.isCalculatingMP = null;

      const result = component.isChangeSetting(match);

      expect(result).toBe(true);
    });

    describe('should return false', () => {
      beforeEach(() => {
        match.isCalculatingSingle = null;
        match.isCheckedCalcMP = null;
      });

      it('when match is calculating single', () => {
        match.isCalculatingSingle = 1;

        const result = component.isChangeSetting(match);

        expect(result).toBe(false);
      });

      it('when match is waiting for single calculation', () => {
        match.isCalculatingSingle = 0;

        const result = component.isChangeSetting(match);

        expect(result).toBe(false);
      });

      it('when match is calculating MP', () => {
        match.isCalculatingMP = 1;

        const result = component.isChangeSetting(match);

        expect(result).toBe(false);
      });

      it('when match is waiting for MP calculation', () => {
        match.isCalculatingMP = 0;

        const result = component.isChangeSetting(match);

        expect(result).toBe(false);
      });
    });
  });

  describe('getRemarkStatusTooltip', () => {
    it('should return tooltip when all status are marked', () => {
      const remark: Remark = {
        isKeyHold: true,
        isMtdHold: true,
        isPending: true,
        isUndecided: true,
        isUnderSettle: true,
      };

      const result = component.getRemarkStatusTooltip(remark);
      const expected = "MTD. Hold\nUndecided\nResult Pending\nUnder Settlement\nHold Key\n";

      expect(result).toEqual(expected);
    });

    it('should return empty tooltip when all status are not marked', () => {
      const remark = new Remark();

      const result = component.getRemarkStatusTooltip(remark);

      expect(result).toEqual('');
    });
  });

  describe('popupChangeRemarkSetting', () => {
    it('should call popupService when match is not locked', () => {
      match.isCalculatingSingle = 3;
      match.isCalculatingMP = 3;
      spyOn(popupService, 'popupChangeRemark');

      component.popupChangeRemarkSetting(match);

      expect(popupService.popupChangeRemark).toHaveBeenCalled();
    });

    it('should not call popup service when match is locked', () => {
      match.isCalculatingSingle = 0;
      spyOn(popupService, 'popupChangeRemark');

      component.popupChangeRemarkSetting(match);

      expect(popupService.popupChangeRemark).toHaveBeenCalledTimes(0);
    });
  });

  it('isExistIntervalConfirmed - should return true when exist interval confirmed', () => {
    const interval1 = new Score('2', '1');
    const interval2 = new Score('3', '4');
    interval2.isConfirmed = true;
    interval2.isNotSettled = true;
    const intervals = [
      interval1,
      interval2
    ];

    const result = component.isExistIntervalConfirmed(intervals);

    expect(result).toBe(true);
  });

  describe('isFinalConfirmed', () => {
    it('should return true when final score is confirmed with interval sport', () => {
      match.sportType = 2;
      match.moreScores = new MoreScore();
      match.moreScores.finalScore = new Score('-', '-');
      match.moreScores.finalScore.isConfirmed = true;
      match.moreScores.finalScore.isNotSettled = true;

      const result = component.isFinalConfirmed(match);

      expect(result).toBe(true);
    });

    it('should return true when final score is confirmed with other sports', () => {
      match.sportType = 25;
      match.suspenderFullTime = 'abc';
      match.finalHomeScore = 1;
      match.finalAwayScore = 0;
      match.isCalculated = false;
      match.isCalRefund = false;

      const result = component.isFinalConfirmed(match);

      expect(result).toBe(true);
    });

    it('should return false when sport not supported', () => {
      match.sportType = 1;

      const result = component.isFinalConfirmed(match);

      expect(result).toBe(false);
    });
  })

  describe('isHalfTimeConfirmed', () => {
    it('should return true when basketball match has half time score confirmed with interval sport', () => {
      match.sportType = 2;
      match.moreScores = new MoreScore();
      match.moreScores.halfTimeScore = new Score('-', '-');
      match.moreScores.halfTimeScore.isConfirmed = true;
      match.moreScores.halfTimeScore.isNotSettled = true;

      const result = component.isHalfTimeConfirmed(match);

      expect(result).toBe(true);
    });

    it('should return true when match has half time score confirmed with other sport', () => {
      match.sportType = 49;
      match.suspenderHalfTime = 'abc';
      match.halfTimeHomeScore = 1;
      match.halfTimeAwayScore = 0;
      match.isHalfTimeCal = false;
      match.isCalRefund = false;

      const result = component.isHalfTimeConfirmed(match);

      expect(result).toBe(true);
    });

    it('should return false when sport not supported', () => {
      match.sportType = 1;

      const result = component.isHalfTimeConfirmed(match);

      expect(result).toBe(false);
    });
  });


  describe('getHalfTimeHomeScore', () => {
    it('should return dash when score is hiden', () => {
      match.sportType = 49;
      match.isHalfTimeCal = false;
      match.isCalRefund = false;
      permission.isLeader = false;
      component.permission = permission;

      const result = component.getHalfTimeHomeScore(match);

      expect(result).toEqual('-');
    });

    it('should return half time score by more score', () => {
      match.sportType = SportType.basketBall;
      match.moreScores.halfTimeScore.home = '1';
      permission.isLeader = true;
      component.permission = permission;

      const result = component.getHalfTimeHomeScore(match);

      expect(result).toEqual('1');
    });

    it('should return half time home score', () => {
      match.sportType = SportType.football;
      match.halfTimeHomeScore = 2;
      permission.isLeader = true;
      component.permission = permission;

      const result = component.getHalfTimeHomeScore(match);

      expect(result).toEqual('2');
    });

    it('should return dash when match not support half time score', () => {
      match.sportType = SportType.sepakTakraw;
      permission.isLeader = true;
      component.permission = permission;

      const result = component.getHalfTimeHomeScore(match);

      expect(result).toEqual('-');
    });
  });

  describe('getHalfTimeAwayScore', () => {
    it('should return dash when score is hiden', () => {
      match.sportType = 49;
      match.isHalfTimeCal = false;
      match.isCalRefund = false;
      permission.isLeader = false;
      component.permission = permission;

      const result = component.getHalfTimeAwayScore(match);

      expect(result).toEqual('-');
    });

    it('should return half time score by more score', () => {
      match.sportType = SportType.basketBall;
      match.moreScores.halfTimeScore.away = '0';
      permission.isLeader = true;
      component.permission = permission;

      const result = component.getHalfTimeAwayScore(match);

      expect(result).toEqual('0');
    });

    it('should return half time away score', () => {
      match.sportType = SportType.football;
      match.halfTimeAwayScore = 0;
      permission.isLeader = true;
      component.permission = permission;

      const result = component.getHalfTimeAwayScore(match);

      expect(result).toEqual('0');
    });

    it('should return dash when match not support half time score', () => {
      match.sportType = SportType.sepakTakraw;
      permission.isLeader = true;
      component.permission = permission;

      const result = component.getHalfTimeAwayScore(match);

      expect(result).toEqual('-');
    });
  });

  describe('getFinalHomeScore', () => {
    it('should return dash when score is hiden', () => {
      match.sportType = 25;
      match.isCalRefund = false;
      match.isCalRefund = false;
      permission.isLeader = false;
      component.permission = permission;

      const result = component.getFinalHomeScore(match);

      expect(result).toEqual('-');
    });

    it('should return final home score by more score', () => {
      match.sportType = SportType.basketBall;
      match.moreScores.finalScore = new Score('2', '3', '');
      permission.isLeader = true;
      component.permission = permission;

      const result = component.getFinalHomeScore(match);

      expect(result).toEqual('2');
    });

    it('should return final home score', () => {
      match.sportType = SportType.football;
      match.finalHomeScore = 1;
      permission.isLeader = true;
      component.permission = permission;

      const result = component.getFinalHomeScore(match);

      expect(result).toEqual('1');
    });
  });

  describe('getFinalAwayScore', () => {
    it('should return dash when score is hiden', () => {
      match.sportType = 25;
      match.isCalRefund = false;
      match.isCalRefund = false;
      permission.isLeader = false;
      component.permission = permission;

      const result = component.getFinalAwayScore(match);

      expect(result).toEqual('-');
    });

    it('should return final away score by more score', () => {
      match.sportType = SportType.basketBall;
      permission.isLeader = true;
      component.permission = permission;

      const result = component.getFinalAwayScore(match);

      expect(result).toEqual('3');
    });

    it('should return final away score', () => {
      match.sportType = SportType.football;
      match.finalAwayScore = 2;
      permission.isLeader = true;
      component.permission = permission;

      const result = component.getFinalAwayScore(match);

      expect(result).toEqual('2');
    });
  });

  describe('changeAutoSetting', () => {
    it('should do nothing when not having permission', () => {
      permission.canAutoPayout = false;
      component.permission = permission;
      spyOn(popupService, 'openUpdatePayoutForMatch');

      component.changeAutoSetting(match);

      expect(popupService.openUpdatePayoutForMatch).not.toHaveBeenCalled();
    });

    it('should update popup change setting when has permission', () => {
      permission.canAutoPayout = true;
      component.permission = permission;
      spyOn(popupService, 'openUpdatePayoutForMatch');

      component.changeAutoSetting(match);

      expect(popupService.openUpdatePayoutForMatch).toHaveBeenCalled();
    });
  });

  describe('changeAutoLeague', () => {
    it('should do nothing when not having permission', () => {
      permission.canAutoPayout = false;
      component.permission = permission;
      spyOn(popupService, 'openUpdatePayoutForLeague');

      component.changeAutoLeague(league);

      expect(popupService.openUpdatePayoutForLeague).not.toHaveBeenCalled();
    });

    it('should update popup change setting when has permission', fakeAsync(() => {
      permission.canAutoPayout = true;
      component.permission = permission;
      spyOn(popupService, 'openUpdatePayoutForLeague');

      component.changeAutoLeague(league);

      expect(popupService.openUpdatePayoutForLeague).toHaveBeenCalled();
    }));
  });

  describe('getInterval', () => {
    it('return all interval when match not bom 30', () => {
      match.bestOfMap = 5;
      match.intervalScore = [new Score('1', '1', '')];

      const result = component.getInterval(match);

      expect(result.length).toEqual(1);
    });

    it('return nine result when match is bom 30', () => {
      match.bestOfMap = 11;
      match.sportType = SportType.eSports;
      const score = new Score('1', '1', '');
      for (let i = 0; i < 11; i++) {
        match.intervalScore.push(score);

      }
      const result = component.getInterval(match);

      expect(result.length).toEqual(9);
    });
  });
});
