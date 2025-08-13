import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { RefundActionsComponent } from './refund-actions.component';
import { RefundStorage } from '../../../../storage/refund.storage';
import { RefundService } from '../../services/refund.service';
import { VerifyService } from '../../services/verify.service';
import { VerificationBaseService } from '../../../../services/verification-base.service';
import { LogicService } from '../../services/logic.service';
import { ResourceStatusPipe } from '../../../../pipes/resource-status.pipe';
import { ResourceNamePipe } from '../../../../pipes/resource-name.pipe';
import { OnlyGoalRecordDirective } from '../../../../directives/only-goal-record.directive.native';
import { OnlyIntegerDirective } from '../../../../../shared/directives/only-integer.directive.native';
import { Match, MatchDetail, HedgeMatchDetail, BetDaq, BetFair } from '../../models/match.model';
import { ResultDetail } from '../../../../models';
import { Permission } from '../../../../../shared/models/sportsbook-sop';
import { ResourceIds } from '../../../../constants';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';

describe('RefundActionsComponent', () => {
  let component: RefundActionsComponent;
  let fixture: ComponentFixture<RefundActionsComponent>;
  let refundStorage: RefundStorage;
  let refundService: RefundService;
  let verifyService: VerifyService;
  let verificationService: VerificationBaseService;
  let logicService: LogicService;
  let resourceStatusPipe: ResourceStatusPipe;

  const matchDetail = {
    isWarningGoalRecord: false,
    isScoreInconsistent: false,
    isSettleDetermined: false,
    applyHedgeMatch: false
  } as MatchDetail;
  const betFair = {
    settleDeterminedBetFair: false
  } as BetFair;
  const betDaq = {
    settleDeterminedBetDaq: false
  } as BetDaq;

  const permission: Permission = {
    canCalculate: true,
    canUncalculate: true,
    canRefund: true,
    isLeader: true,
    canUncalculateInstant: false,
    isTrader: false,
    canViewSettlementLog: false,
    canAutoPayout: false,
    canMarkPending: false,
    canMarkUnDecided: false,
    canChangeScoreSource: false
  };

  const mockMatch: Match = {
    matchDetail,
    permission,
    resultDetails: [],
    hedgeMatchDetail: null,
    betDaq,
    betFair,
    externalResults: []
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RefundActionsComponent,
        FormsModule,
        MatTooltipModule,
        ToastrModule.forRoot(),
        HttpClientModule
      ],
      providers: [
        ResourceStatusPipe,
        { provide: ResourceNamePipe, useValue: { transform: jest.fn().mockReturnValue('Full Time') } },
        RefundStorage,
        RefundService,
        VerifyService,
        VerificationBaseService,
        LogicService
      ]
    })
    .overrideDirective(OnlyGoalRecordDirective, {})
    .overrideDirective(OnlyIntegerDirective, {})
    .compileComponents();
    
    fixture = TestBed.createComponent(RefundActionsComponent);
    component = fixture.componentInstance;

    // Get service instances
    refundStorage = TestBed.inject(RefundStorage);
    refundService = TestBed.inject(RefundService);
    verifyService = TestBed.inject(VerifyService);
    verificationService = TestBed.inject(VerificationBaseService);
    logicService = TestBed.inject(LogicService);
    resourceStatusPipe = TestBed.inject(ResourceStatusPipe);

    // Setup spies
    jest.spyOn(refundStorage, 'getMatch').mockReturnValue(mockMatch);
    jest.spyOn(refundStorage, 'clear').mockImplementation();
    jest.spyOn(refundStorage, 'clearFullTimeResult').mockImplementation();
    jest.spyOn(refundStorage, 'getHalfTimeResult').mockReturnValue({} as ResultDetail);
    jest.spyOn(refundStorage, 'getFullTimeResult').mockReturnValue({} as ResultDetail);
    jest.spyOn(refundStorage, 'setIsDeterminedHedgeMatch').mockImplementation();

    jest.spyOn(refundService, 'refund').mockImplementation();
    jest.spyOn(refundService, 'confirmRefund').mockImplementation();

    jest.spyOn(verifyService, 'verifyScore').mockImplementation();

    jest.spyOn(verificationService, 'isHtGoalRecordInvalidWithResultDetail').mockReturnValue(false);
    jest.spyOn(verificationService, 'isFullTimeGoalRecordInvalidWithResultDetail').mockReturnValue(false);

    jest.spyOn(logicService, 'settleDetermineUpdate').mockImplementation();
    jest.spyOn(logicService, 'getActionName').mockReturnValue('refund');

    jest.spyOn(resourceStatusPipe, 'transform').mockReturnValue('active');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize component properties from storage', () => {
      component.ngOnInit();

      expect(refundStorage.getMatch).toHaveBeenCalled();
      expect(component.matchDetail).toBe(mockMatch.matchDetail);
      expect(component.hedgeMatchDetail).toBe(mockMatch.hedgeMatchDetail);
      expect(component.resultDetails).toBe(mockMatch.resultDetails);
      expect(component.permission).toBe(mockMatch.permission);
      expect(component.betDaq).toBe(mockMatch.betDaq);
      expect(component.betFair).toBe(mockMatch.betFair);
    });

    it('should set disableGoalRecordCheckbox when conditions are met', () => {
      const matchWithGoalRecord = {
        ...mockMatch,
        matchDetail: { ...mockMatch.matchDetail, isExistResultAndFirstTeamScore: true }
      };
      jest.spyOn(refundStorage, 'getMatch').mockReturnValue(matchWithGoalRecord);

      component.ngOnInit();

      expect(component.disableGoalRecordCheckbox).toBe(true);
      expect(component.matchDetail.applyGoalRecord).toBe(true);
    });

    it('should set isExistedConfirmRefund when confirmed refund exists', () => {
      const resultWithConfirmed = {
        resourceId: ResourceIds.fullTime,
        resultSettingData: {
          isHoldResult: false,
          isConfirmedRefund: true,
          isConfirmedRefundSdt: false,
          isConfirmedRefundMercy: false,
          iconHoldResult: ''
        }
      } as ResultDetail;

      const matchWithConfirmedRefund = {
        ...mockMatch,
        resultDetails: [resultWithConfirmed]
      };
      jest.spyOn(refundStorage, 'getMatch').mockReturnValue(matchWithConfirmedRefund);

      component.ngOnInit();

      expect(component.isExistedConfirmRefund).toBe(true);
    });

    it('should set applyHedgeMatch when hedge match is determined', () => {
      const hedgeMatchDetail = {
        matchId: 2,
        matchCode: 'HEDGE001',
        isDeterminedHedgeMatch: false,
        isUndecided: false
      } as HedgeMatchDetail;

      const matchWithDeterminedHedge = {
        ...mockMatch,
        hedgeMatchDetail
      };
      jest.spyOn(refundStorage, 'getMatch').mockReturnValue(matchWithDeterminedHedge);

      component.ngOnInit();

      expect(component.matchDetail.applyHedgeMatch).toBe(true);
      expect(component.disableSettleDeterminedHedgeMatch).toBe(false);
    });

    it('should call verifyScore and onResultCheckedChange', () => {
      component.ngOnInit();

      expect(verifyService.verifyScore).toHaveBeenCalled();
      expect(logicService.settleDetermineUpdate).toHaveBeenCalled();
    });
  });

  describe('changeScore', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should clear storage and verify score', () => {
      const result = {} as ResultDetail;

      component.changeScore(result);

      expect(refundStorage.clear).toHaveBeenCalled();
      expect(verifyService.verifyScore).toHaveBeenCalled();
    });

    it('should clear full time result when resource is half time', () => {
      const halfTimeResult = {
        resourceId: ResourceIds.halfTime
      } as ResultDetail;

      component.changeScore(halfTimeResult);

      expect(refundStorage.clearFullTimeResult).toHaveBeenCalled();
    });
  });

  describe('changeApplyHedgeMatch', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should enable settle determined when applyHedgeMatch is true', () => {
      component.matchDetail.applyHedgeMatch = true;

      component.changeApplyHedgeMatch();

      expect(component.disableSettleDeterminedHedgeMatch).toBe(false);
    });

    it('should disable settle determined when applyHedgeMatch is false', () => {
      component.matchDetail.applyHedgeMatch = false;
      component.isDeterminedHedgeMatch = true;

      component.changeApplyHedgeMatch();

      expect(component.disableSettleDeterminedHedgeMatch).toBe(true);
      expect(component.isDeterminedHedgeMatch).toBe(false);
    });
  });

  describe('changeIsDeterminedHedgeMatch', () => {
    it('should set isDeterminedHedgeMatch in storage', () => {
      component.isDeterminedHedgeMatch = true;

      component.changeIsDeterminedHedgeMatch();

      expect(refundStorage.setIsDeterminedHedgeMatch).toHaveBeenCalledWith(true);
    });
  });

  describe('onSettleDeterminableTicketsChange', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should reset settle determined flags when isSettleDetermined is false', () => {
      component.matchDetail.isSettleDetermined = false;
      component.betDaq.settleDeterminedBetDaq = true;
      component.betFair.settleDeterminedBetFair = true;

      component.onSettleDeterminableTicketsChange();

      expect(component.betDaq.settleDeterminedBetDaq).toBe(false);
      expect(component.betFair.settleDeterminedBetFair).toBe(false);
      expect(logicService.settleDetermineUpdate).toHaveBeenCalled();
    });

    it('should not reset flags when isSettleDetermined is true', () => {
      component.matchDetail.isSettleDetermined = true;
      component.betDaq.settleDeterminedBetDaq = true;
      component.betFair.settleDeterminedBetFair = true;

      component.onSettleDeterminableTicketsChange();

      expect(component.betDaq.settleDeterminedBetDaq).toBe(true);
      expect(component.betFair.settleDeterminedBetFair).toBe(true);
    });
  });

  describe('goalRecordModelChange', () => {
    beforeEach(() => {
      component.ngOnInit();
      jest.spyOn(refundStorage, 'getHalfTimeResult').mockReturnValue({ isEnabled: true } as ResultDetail);
      jest.spyOn(refundStorage, 'getFullTimeResult').mockReturnValue({ isEnabled: true } as ResultDetail);
    });

    it('should set warning when goal record is invalid', () => {
      jest.spyOn(verificationService, 'isHtGoalRecordInvalidWithResultDetail').mockReturnValue(true);

      component.goalRecordModelChange();

      expect(component.matchDetail.isWarningGoalRecord).toBe(true);
    });

    it('should clear warning when goal record is valid', () => {
      component.matchDetail.isWarningGoalRecord = true;

      component.goalRecordModelChange();

      expect(component.matchDetail.isWarningGoalRecord).toBe(false);
    });
  });

  describe('refund', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should clear storage and call refund service', () => {
      component.refund();

      expect(refundStorage.clear).toHaveBeenCalled();
      expect(refundService.refund).toHaveBeenCalledWith(component.matchDetail.isSettleDetermined);
    });
  });

  describe('onResultCheckedChange', () => {
    it('should enable action when at least one result is checked', () => {
      const result = { checked: true } as ResultDetail;
      component.resultDetails = [result];

      component.onResultCheckedChange();

      expect(component.enableAction).toBe(true);
      expect(logicService.settleDetermineUpdate).toHaveBeenCalled();
    });

    it('should disable action when no results are checked', () => {
      const result = { checked: false } as ResultDetail;
      component.resultDetails = [result];

      component.onResultCheckedChange();

      expect(component.enableAction).toBe(false);
    });
  });

  describe('confirmRefund', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should clear storage and call confirm refund service', () => {
      component.confirmRefund();

      expect(refundStorage.clear).toHaveBeenCalled();
      expect(logicService.getActionName).toHaveBeenCalled();
      expect(refundService.confirmRefund).toHaveBeenCalledWith(
        component.matchDetail.isSettleDetermined,
        'refund'
      );
    });
  });

  describe('getResultRowClass', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should return mismatched when score is inconsistent', () => {
      component.matchDetail.isScoreInconsistent = true;

      const result = component.getResultRowClass({} as ResultDetail);
      expect(result).toBe('mismatched');
    });

    it('should return confirmed-refund when leader and result is confirmed', () => {
      component.matchDetail.isScoreInconsistent = false;
      component.permission.isLeader = true;
      const resultWithConfirmed = {
        resultSettingData: {
          isHoldResult: false,
          isConfirmedRefund: true,
          isConfirmedRefundSdt: false,
          isConfirmedRefundMercy: false,
          iconHoldResult: ''
        }
      } as ResultDetail;

      const result = component.getResultRowClass(resultWithConfirmed);

      expect(result).toBe('confirmed-refund');
    });

    it('should return resource status when no special conditions', () => {
      component.matchDetail.isScoreInconsistent = false;
      component.permission.isLeader = false;
      const result = component.getResultRowClass({ 
        settlementStatusId: 4, // Calculated status
        resultSettingData: {
          isHoldResult: false,
          isConfirmedRefund: false,
          isConfirmedRefundSdt: false,
          isConfirmedRefundMercy: false,
          iconHoldResult: ''
        }
      } as ResultDetail);
      expect(result).toBe('calculated');
    });
  });

  describe('Template interactions', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should display hedge match checkbox when hedgeMatchDetail exists', () => {
      const hedgeMatchDetail = {
        matchId: 2,
        matchCode: 'HEDGE001',
        isDeterminedHedgeMatch: false,
        isUndecided: false
      } as HedgeMatchDetail;

      const matchWithHedge = {
        ...mockMatch,
        hedgeMatchDetail
      };
      jest.spyOn(refundStorage, 'getMatch').mockReturnValue(matchWithHedge);
      
      component.ngOnInit();
      fixture.detectChanges();

      const hedgeMatchElement = fixture.debugElement.query(By.css('.hedge-match'));
      expect(hedgeMatchElement).toBeTruthy();
    });

    it('should display result details table', () => {
      const tableElement = fixture.debugElement.query(By.css('table'));
      expect(tableElement).toBeTruthy();
    });

    it('should display refund button', () => {
      const refundButton = fixture.debugElement.query(By.css('.button-refund'));
      expect(refundButton).toBeTruthy();
    });

    it('should display confirm refund button when leader and no confirmed refund exists', () => {
      // Ensure the component is properly initialized with leader permissions and no confirmed refund
      component.permission.isLeader = true;
      component.isExistedConfirmRefund = false;
      component.enableAction = true;
      fixture.detectChanges();
      
      const confirmButton = fixture.debugElement.query(By.css('button[class*="btn-warning"]'));
      expect(confirmButton).toBeTruthy();
    });

    it('should disable buttons when no action is enabled', () => {
      component.enableAction = false;
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.css('button[disabled]'));
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
}); 