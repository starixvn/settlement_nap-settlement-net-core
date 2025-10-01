import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { BandyCalculationComponent } from './calculation.component';
import { AioService, BlockUIService, MessageBoxService } from '../../../shared/services';
import { ResultDetailsService } from './resultdetails.service';
import { ValidationService } from './validation.service';
import { BandyService } from './bandy.service';
import { BetStatusService } from './betstatus.service';
import { MatchAio } from '../../models/match-aio.model';
import { MatchDetail, ResultDetail, Permission, ExternalResult, ExternalResultDetail } from '../../../shared/models/sportsbook-sop';
import { ResourceID, LeagueType, KickOffTime, RefResultStatus } from '../../constants';
import { CalculateAction, MatchStatus, ResultStatusId, SettlementStatusId } from '../../../shared/constants';
import { Result } from '../../../shared/models/result.model';
import { Language } from '../../../shared/language.native';
import { UrlHelper } from '../../../helper/url-helper';

describe('BandyCalculationComponent', () => {
  let component: BandyCalculationComponent;
  let fixture: ComponentFixture<BandyCalculationComponent>;
  let mockAioService: jest.Mocked<AioService>;
  let mockToastrService: jest.Mocked<ToastrService>;
  let mockBlockUIService: jest.Mocked<BlockUIService>;
  let mockMessageBoxService: jest.Mocked<MessageBoxService>;
  let mockResultDetailsService: jest.Mocked<ResultDetailsService>;
  let mockValidationService: jest.Mocked<ValidationService>;
  let mockBandyService: jest.Mocked<BandyService>;
  let mockBetStatusService: jest.Mocked<BetStatusService>;

  const mockMatchDetail = {
    matchId: 12345,
    sportType: 1,
    leagueType: LeagueType.OtPenalty,
    parentId: 0,
    playTime: 90,
    confirmHT: 0,
    confirmFT: 0,
    eventStatus: 'Running',
    homeTeam: 'Team A',
    awayTeam: 'Team B',
    matchCode: 'TEST123',
    kickOffTime: new Date(),
    leagueName: 'Test League',
    leagueId: 1,
    isFantasy: false,
    homeName: 'Team A',
    awayName: 'Team B',
    homeId: 'home1',
    awayId: 'away1'
  } as any;

  const mockResultDetail: ResultDetail = {
    resourceId: ResourceID.Final,
    homeValue: '2',
    awayValue: '1',
    checked: true,
    disabled: false,
    settlementStatusId: SettlementStatusId.Calculated,
    resultStatusId: 0,
    resultSettingData: {
      isConfirmedRefund: false
    }
  } as ResultDetail;

  const mockPermission: Permission = {
    isLeader: true
  } as Permission;

  const mockMatch: MatchAio = {
    matchDetail: mockMatchDetail,
    resultDetails: [mockResultDetail],
    permission: mockPermission,
    externalResults: [],
    isClickOnCalculate: false,
    isScoreDirect: true
  } as MatchAio;

  beforeEach(async () => {
    const aioServiceSpy = {
      getMatch: jest.fn(),
      verifyChangedSettledTickets: jest.fn()
    };

    const toastrServiceSpy = {
      clear: jest.fn(),
      error: jest.fn(),
      overlayContainer: null
    };

    const blockUIServiceSpy = {
      blockUIEvent: {
        subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() })
      }
    };

    const messageBoxServiceSpy = {
      confirm: jest.fn(),
      closePopup: jest.fn()
    };

    const resultDetailsServiceSpy = {
      generateConfirmResultDetails: jest.fn(),
      generateFullExternalResultDetails: jest.fn(),
      hidenScoreResultDetails: jest.fn(),
      generateFullResultDetails: jest.fn(),
      disabledInputResult: jest.fn(),
      resetHomeAwayValue: jest.fn(),
      calcMatchResultDetails: jest.fn(),
      copyResultFromProvider: jest.fn()
    };

    const validationServiceSpy = {
      inValidResultDetailWithProvider: jest.fn(),
      invalidInputScore: jest.fn(),
      invalidFistHalf: jest.fn(),
      inValidResult: jest.fn(),
      allowCalcFinalResult: jest.fn(),
      isInsufficientSOPLite: jest.fn(),
      isConsistentScoreSOPLite: jest.fn(),
      hasScore: jest.fn(),
      getCalculationConfirmMessage: jest.fn(),
      verifyResultChanged: jest.fn()
    };

    const bandyServiceSpy = {
      getIntervalBackground: jest.fn(),
      sendSettleRequest: jest.fn()
    };

    const betStatusServiceSpy = {
      createBetStatusCalc: jest.fn(),
      createBetStatusRefund: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        BandyCalculationComponent,
        HttpClientTestingModule,
        ToastrModule.forRoot({
          timeOut: 3000,
          positionClass: 'toast-top-right',
          preventDuplicates: true,
        })
      ],
      providers: [
        { provide: AioService, useValue: aioServiceSpy },
        { provide: ToastrService, useValue: toastrServiceSpy },
        { provide: BlockUIService, useValue: blockUIServiceSpy },
        { provide: MessageBoxService, useValue: messageBoxServiceSpy },
        { provide: ResultDetailsService, useValue: resultDetailsServiceSpy },
        { provide: ValidationService, useValue: validationServiceSpy },
        { provide: BandyService, useValue: bandyServiceSpy },
        { provide: BetStatusService, useValue: betStatusServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BandyCalculationComponent);
    component = fixture.componentInstance;
    
    mockAioService = TestBed.inject(AioService) as jest.Mocked<AioService>;
    mockToastrService = TestBed.inject(ToastrService) as jest.Mocked<ToastrService>;
    mockBlockUIService = TestBed.inject(BlockUIService) as jest.Mocked<BlockUIService>;
    mockMessageBoxService = TestBed.inject(MessageBoxService) as jest.Mocked<MessageBoxService>;
    mockResultDetailsService = TestBed.inject(ResultDetailsService) as jest.Mocked<ResultDetailsService>;
    mockValidationService = TestBed.inject(ValidationService) as jest.Mocked<ValidationService>;
    mockBandyService = TestBed.inject(BandyService) as jest.Mocked<BandyService>;
    mockBetStatusService = TestBed.inject(BetStatusService) as jest.Mocked<BetStatusService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  describe('getter methods', () => {
    beforeEach(() => {
      component.matchDetail = mockMatchDetail;
      component.permission = mockPermission;
      component.resultDetails = [mockResultDetail];
    });

    it('should return leagueType from matchDetail', () => {
      expect(component.leagueType).toBe(LeagueType.OtPenalty);
    });

    it('should return isLeader from permission', () => {
      expect(component.isLeader).toBe(true);
    });

    it('should return true when existsSelectedResult has checked items', () => {
      expect(component.existsSelectedResult).toBe(true);
    });

    it('should return false when existsSelectedResult has no checked items', () => {
      component.resultDetails[0].checked = false;
      expect(component.existsSelectedResult).toBe(false);
    });

    it('should return selectedResults filtered by checked and not disabled', () => {
      // Arrange - ensure the result detail is checked
      component.resultDetails[0].checked = true;
      
      const result = component.selectedResults;
      expect(result).toEqual([mockResultDetail]);
    });

    it('should return finalResult by resourceId', () => {
      const result = component.finalResult;
      expect(result).toBe(mockResultDetail);
    });

    it('should return firstHalfResult by resourceId', () => {
      const firstHalfDetail = { ...mockResultDetail, resourceId: ResourceID.FirstHalf };
      component.resultDetails = [firstHalfDetail, mockResultDetail];
      
      const result = component.firstHalfResult;
      expect(result).toBe(firstHalfDetail);
    });

    it('should return true for onlySelectedFirstHalf when only first half is selected', () => {
      const firstHalfDetail = { ...mockResultDetail, resourceId: ResourceID.FirstHalf, checked: true };
      component.resultDetails = [firstHalfDetail];
      
      expect(component.onlySelectedFirstHalf).toBe(true);
    });
  });

  describe('onSelectResult', () => {
    beforeEach(() => {
      component.match = mockMatch;
      component.resultDetails = [
        { ...mockResultDetail, resourceId: ResourceID.FullTime },
        { ...mockResultDetail, resourceId: ResourceID.Et },
        { ...mockResultDetail, resourceId: ResourceID.Pen },
        { ...mockResultDetail, resourceId: ResourceID.Final }
      ];
    });

    it('should select related results when FullTime is selected', () => {
      // Act
      component.onSelectResult(true, ResourceID.FullTime);

      // Assert
      expect(component.match.isClickOnCalculate).toBe(false);
      expect(component.resultDetails[1].checked).toBe(true); // Et
      expect(component.resultDetails[2].checked).toBe(true); // Pen
      expect(component.resultDetails[3].checked).toBe(true); // Final
    });

    it('should deselect related results when FullTime is deselected', () => {
      // Arrange
      component.resultDetails.forEach(result => result.checked = true);

      // Act
      component.onSelectResult(false, ResourceID.FullTime);

      // Assert
      expect(component.resultDetails[1].checked).toBe(false); // Et
      expect(component.resultDetails[2].checked).toBe(false); // Pen
      expect(component.resultDetails[3].checked).toBe(false); // Final
    });
  });

  describe('isErrorOnVerification', () => {
    beforeEach(() => {
      component.match = mockMatch;
    });

    it('should return true when calculate is clicked and result has no values', () => {
      // Arrange
      component.match.isClickOnCalculate = true;
      const resultDetail = { ...mockResultDetail, checked: true, disabled: false, homeValue: '', awayValue: '' };

      // Act
      const result = component.isErrorOnVerification(resultDetail);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when calculate is not clicked', () => {
      // Arrange
      component.match.isClickOnCalculate = false;
      const resultDetail = { ...mockResultDetail, checked: true, disabled: false, homeValue: '', awayValue: '' };

      // Act
      const result = component.isErrorOnVerification(resultDetail);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('viewExternalScore', () => {
    beforeEach(() => {
      component.providerResultDetails = [
        {
          resourceId: ResourceID.Final,
          homeValue: '2',
          awayValue: '1',
          providerExternalId: 'ext123',
          matchId: 12345,
          sourceName: 'Test Source',
          sourceId: 1,
          resourceName: 'Final',
          resourceType: 'score',
          resourceValue: '2:1',
          resultStatusId: 1,
          settlementStatusId: 4,
          resultStatus: 'Calculated',
          isInvalidValue: false,
          homeName: 'Team A',
          awayName: 'Team B',
          checked: false,
          isResultWarning: false,
          isDurationWarning: false,
          externalScores: [],
          isScoreMismatched: false,
          isShow: true,
          disabled: false,
          resultSettingData: null,
          originalHomeValue: '2',
          originalAwayValue: '1',
          className: '',
          groupId: 'group1',
          resultName: 'Final Score',
          groupName: 'Main',
          inputType: 1,
          isSpecialBettype: 0,
          isDisplayedForMember: true,
          inputOptions: [],
          multipleResultSelect: null,
          otherInfo: '',
          isResultWarningByBetType: false,
          ordNo: 1,
          intervalNo: 1,
          isNotTaken: false,
          isSettleDetermined: false,
          isSettleDeterminedOriginal: false,
          isInvalidSelectedProceed: false,
          isNotExistedValue: false,
          resultStatusState: 'active'
        } as any
      ];
    });

    it('should return formatted score when values exist', () => {
      // Act
      const result = component.viewExternalScore(ResourceID.Final);

      // Assert
      expect(result).toBe('2:1');
    });

    it('should return dash when values are empty', () => {
      // Arrange
      component.providerResultDetails[0].homeValue = '';
      component.providerResultDetails[0].awayValue = '';

      // Act
      const result = component.viewExternalScore(ResourceID.Final);

      // Assert
      expect(result).toBe('-');
    });
  });

  describe('utility methods', () => {
    it('should return true for isFulltimeResult with FullTime resourceId', () => {
      expect(component.isFulltimeResult(ResourceID.FullTime)).toBe(true);
    });

    it('should return false for isFulltimeResult with other resourceId', () => {
      expect(component.isFulltimeResult(ResourceID.Final)).toBe(false);
    });

    it('should return true for isFistHalf with FirstHalf resourceId', () => {
      expect(component.isFistHalf(ResourceID.FirstHalf)).toBe(true);
    });

    it('should return false for isFistHalf with other resourceId', () => {
      expect(component.isFistHalf(ResourceID.Final)).toBe(false);
    });

    it('should return true for isConfirmed when leader and confirmed refund', () => {
      // Arrange
      component.permission = { isLeader: true } as Permission;
      component.resultDetails = [{ 
        ...mockResultDetail, 
        resultSettingData: { 
          isConfirmedRefund: true,
          isHoldResult: false,
          isConfirmedRefundSdt: false,
          isConfirmedRefundMercy: false,
          iconHoldResult: ''
        } as any
      }];

      // Act
      const result = component.isConfirmed(mockResultDetail);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('copyScore', () => {
    beforeEach(() => {
      component.externalResult = { sourceName: 'Test Provider' } as ExternalResult;
      component.providerResultDetails = [{
        resourceId: ResourceID.Final,
        homeValue: '2',
        awayValue: '1',
        providerExternalId: 'ext123',
        matchId: 12345,
        sourceName: 'Test Source',
        sourceId: 1,
        resourceName: 'Final',
        resourceType: 'score',
        resourceValue: '2:1',
        resultStatusId: 1,
        settlementStatusId: 4,
        resultStatus: 'Calculated',
        isInvalidValue: false,
        homeName: 'Team A',
        awayName: 'Team B',
        checked: false,
        isResultWarning: false,
        isDurationWarning: false,
        externalScores: [],
        isScoreMismatched: false,
        isShow: true,
        disabled: false,
        resultSettingData: null,
        originalHomeValue: '2',
        originalAwayValue: '1',
        className: '',
        groupId: 'group1',
        resultName: 'Final Score',
        groupName: 'Main',
        inputType: 1,
        isSpecialBettype: 0,
        isDisplayedForMember: true,
        inputOptions: [],
        multipleResultSelect: null,
        otherInfo: '',
        isResultWarningByBetType: false,
        ordNo: 1,
        intervalNo: 1,
        isNotTaken: false,
        isSettleDetermined: false,
        isSettleDeterminedOriginal: false,
        isInvalidSelectedProceed: false,
        isNotExistedValue: false,
        resultStatusState: 'active'
      } as any];
      component.resultDetails = [mockResultDetail];
    });


    it('should return early when no external result', () => {
      // Arrange
      component.externalResult = null;

      // Act
      component.copyScore();

      // Assert
      expect(mockMessageBoxService.confirm).not.toHaveBeenCalled();
    });
  });

  describe('onResettleCheckboxChange', () => {
    it('should update isReSettledTickets', () => {
      // Act
      component.onResettleCheckboxChange(true);

      // Assert
      expect(component.isReSettledTickets).toBe(true);
    });
  });


  describe('getClassName', () => {
    beforeEach(() => {
      component.resultDetails = [mockResultDetail];
      mockValidationService.inValidResult.mockReturnValue(false);
      mockBandyService.getIntervalBackground.mockReturnValue('calculated');
    });

    it('should return correct className for trader confirmed result', () => {
      // Arrange
      const resultDetail = { ...mockResultDetail, resultStatusId: ResultStatusId.TraderConfirm };

      // Act
      const result = component.getClassName(resultDetail);

      // Assert
      expect(result).toContain('bg-result-confirmed');
    });

    it('should add mismatched class when validation fails', () => {
      // Arrange
      mockValidationService.inValidResult.mockReturnValue(true);

      // Act
      const result = component.getClassName(mockResultDetail);

      // Assert
      expect(result).toContain('col-mismatched');
    });

    it('should include interval background class', () => {
      // Act
      const result = component.getClassName(mockResultDetail);

      // Assert
      expect(result).toContain('calculated');
      expect(mockBandyService.getIntervalBackground).toHaveBeenCalledWith(mockResultDetail.settlementStatusId);
    });
  });

  describe('ngOnInit', () => {
    it('should initialize confirmation dialog message and subscribe to blockUI events', () => {
      // Act
      component.ngOnInit();

      // Assert
      expect(component.confirmationDialogMessage.title).toBe(Language.confirmationBox);
      expect(mockBlockUIService.blockUIEvent.subscribe).toHaveBeenCalled();
      expect(mockToastrService.overlayContainer).toBe(component.toastContainer);
    });
  });

  describe('getMatch', () => {
    beforeEach(() => {
      jest.spyOn(UrlHelper, 'getUrlParameter').mockReturnValue('1');
      mockAioService.getMatch.mockResolvedValue(mockMatch);
      jest.spyOn(component as any, 'initialData');
      jest.spyOn(component as any, 'viewData');
    });

    it('should get match data and initialize component', async () => {
      // Act
      await component.getMatch(12345);

      // Assert
      expect(mockAioService.getMatch).toHaveBeenCalledWith({
        matchId: 12345,
        apikey: 'bandy',
        sportType: 1,
        settleType: 'MNL'
      });
      expect(component.match).toBe(mockMatch);
      expect(component['initialData']).toHaveBeenCalled();
      expect(component['viewData']).toHaveBeenCalled();
    });

    it('should handle getMatch error', async () => {
      // Arrange
      const error = new Error('API Error');
      mockAioService.getMatch.mockRejectedValue(error);

      // Act & Assert
      await expect(component.getMatch(12345)).rejects.toThrow('API Error');
    });
  });

  describe('initialData', () => {
    beforeEach(() => {
      component.match = mockMatch;
      mockResultDetailsService.generateConfirmResultDetails.mockReturnValue([]);
      mockResultDetailsService.generateFullExternalResultDetails.mockReturnValue([]);
      jest.spyOn(component as any, 'createProviderResource');
      jest.spyOn(component as any, 'isCompletedOrConfirmScore').mockReturnValue(false);
    });

    it('should initialize component data from match', () => {
      // Act
      component['initialData']();

      // Assert
      expect(component.matchDetail).toBe(mockMatchDetail);
      expect(component.resultDetails).toBe(mockMatch.resultDetails);
      expect(component.originalResults).toEqual(mockMatch.resultDetails);
      expect(component.permission).toBe(mockPermission);
      expect(mockResultDetailsService.generateConfirmResultDetails).toHaveBeenCalledWith(mockMatch.resultDetails);
      expect(component['createProviderResource']).toHaveBeenCalled();
    });

    it('should set isReadyMatch to true when match is completed', () => {
      // Arrange
      jest.spyOn(component as any, 'isCompletedOrConfirmScore').mockReturnValue(true);

      // Act
      component['initialData']();

      // Assert
      expect(component.isReadyMatch).toBe(true);
    });

    it('should show error when minimum play time not reached', () => {
      // Arrange
      component.matchDetail = { ...mockMatchDetail, playTime: 10 };

      // Act
      component['initialData']();

      // Assert
      expect(mockToastrService.error).toHaveBeenCalledWith(Language.minimumPlayTimeNotReached);
    });
  });

  describe('createProviderResource', () => {
    beforeEach(() => {
      component.match = mockMatch;
      mockResultDetailsService.generateFullExternalResultDetails.mockReturnValue([]);
    });

    it('should set external result when available', () => {
      // Arrange
      const externalResult = { sourceName: 'Test Provider' } as ExternalResult;
      component.match.externalResults = [externalResult];

      // Act
      component['createProviderResource']();

      // Assert
      expect(component.externalResult).toBe(externalResult);
      expect(component.externalSourceName).toBe('Test Provider');
      expect(mockResultDetailsService.generateFullExternalResultDetails).toHaveBeenCalledWith(externalResult);
    });

    it('should handle no external results', () => {
      // Arrange
      component.match.externalResults = [];

      // Act
      component['createProviderResource']();

      // Assert
      expect(component.externalResult).toBeNull();
      expect(component.externalSourceName).toBe('-');
    });
  });

  describe('viewData', () => {
    beforeEach(() => {
      component.resultDetails = [mockResultDetail];
      component.permission = { isLeader: true } as Permission;
      mockResultDetailsService.hidenScoreResultDetails.mockReturnValue(undefined);
      mockResultDetailsService.generateFullResultDetails.mockReturnValue([mockResultDetail]);
      jest.spyOn(component as any, 'disabledInputResult');
      jest.spyOn(component as any, 'checkScoreMissMatchedOnload');
    });

    it('should process result details and check for mismatches', () => {
      // Act
      component['viewData']();

      // Assert
      expect(mockResultDetailsService.hidenScoreResultDetails).toHaveBeenCalledWith(component.resultDetails, true);
      expect(mockResultDetailsService.generateFullResultDetails).toHaveBeenCalledWith(component.resultDetails);
      expect(component['disabledInputResult']).toHaveBeenCalled();
      expect(component['checkScoreMissMatchedOnload']).toHaveBeenCalled();
    });
  });

  describe('isCompletedOrConfirmScore', () => {
    it('should return true when confirmHT > 0', () => {
      // Arrange
      const matchDetail = { ...mockMatchDetail, confirmHT: 1 };

      // Act
      const result = component['isCompletedOrConfirmScore'](matchDetail);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when confirmFT > 0', () => {
      // Arrange
      const matchDetail = { ...mockMatchDetail, confirmFT: 1 };

      // Act
      const result = component['isCompletedOrConfirmScore'](matchDetail);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when confirmResultDetails has length', () => {
      // Arrange
      component.confirmResultDetails = [mockResultDetail];
      const matchDetail = { ...mockMatchDetail, confirmHT: 0, confirmFT: 0 };

      // Act
      const result = component['isCompletedOrConfirmScore'](matchDetail);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when event status is completed', () => {
      // Arrange
      const matchDetail = { ...mockMatchDetail, eventStatus: MatchStatus.Completed };

      // Act
      const result = component['isCompletedOrConfirmScore'](matchDetail);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('calculation', () => {
    beforeEach(() => {
      component.match = mockMatch;
      component.resultDetails = [mockResultDetail];
      mockToastrService.clear.mockReturnValue(undefined);
    });

    it('should clear toast and reset refResultStatus', () => {
      // Act
      component.calculation();

      // Assert
      expect(component.match.isClickOnCalculate).toBe(true);
      expect(mockToastrService.clear).toHaveBeenCalled();
      expect(component['refResultStatus']).toBeNull();
    });

    it('should show error when confirmed refund exists', () => {
      // Arrange
      jest.spyOn(component, 'existsConfirmedRefund').mockReturnValue(true);

      // Act
      component.calculation();

      // Assert
      expect(mockToastrService.error).toHaveBeenCalledWith(Language.confirmRefund.calculateResultNotConfirmed);
    });

    it('should show error for invalid input score', () => {
      // Arrange
      jest.spyOn(component, 'existsConfirmedRefund').mockReturnValue(false);
      mockValidationService.invalidInputScore.mockReturnValue(true);

      // Act
      component.calculation();

      // Assert
      expect(mockToastrService.error).toHaveBeenCalledWith(Language.warningInputScore);
    });

    it('should show error for invalid first half when only first half selected', () => {
      // Arrange
      jest.spyOn(component, 'existsConfirmedRefund').mockReturnValue(false);
      mockValidationService.invalidInputScore.mockReturnValue(false);
      Object.defineProperty(component, 'onlySelectedFirstHalf', { get: () => true, configurable: true });
      mockValidationService.invalidFistHalf.mockReturnValue(true);

      // Act
      component.calculation();

      // Assert
      expect(mockToastrService.error).toHaveBeenCalledWith(Language.inconsistentValues);
    });

    it('should show error for invalid result when not only first half selected', () => {
      // Arrange
      jest.spyOn(component, 'existsConfirmedRefund').mockReturnValue(false);
      mockValidationService.invalidInputScore.mockReturnValue(false);
      Object.defineProperty(component, 'onlySelectedFirstHalf', { get: () => false, configurable: true });
      mockValidationService.inValidResult.mockReturnValue(true);

      // Act
      component.calculation();

      // Assert
      expect(mockToastrService.error).toHaveBeenCalledWith(Language.inconsistentValues);
    });

    it('should show error when not allowing calc final result', () => {
      // Arrange
      jest.spyOn(component, 'existsConfirmedRefund').mockReturnValue(false);
      mockValidationService.invalidInputScore.mockReturnValue(false);
      Object.defineProperty(component, 'onlySelectedFirstHalf', { get: () => false, configurable: true });
      mockValidationService.inValidResult.mockReturnValue(false);
      mockValidationService.allowCalcFinalResult.mockReturnValue(false);

      // Act
      component.calculation();

      // Assert
      expect(mockToastrService.error).toHaveBeenCalledWith(Language.IntervalWarning);
    });

    it('should proceed to confirm score source when all validations pass', () => {
      // Arrange
      jest.spyOn(component, 'existsConfirmedRefund').mockReturnValue(false);
      mockValidationService.invalidInputScore.mockReturnValue(false);
      Object.defineProperty(component, 'onlySelectedFirstHalf', { get: () => false, configurable: true });
      mockValidationService.inValidResult.mockReturnValue(false);
      mockValidationService.allowCalcFinalResult.mockReturnValue(true);
      jest.spyOn(component as any, 'confirmScoreSource');

      // Act
      component.calculation();

      // Assert
      expect(component['confirmScoreSource']).toHaveBeenCalled();
    });
  });

  describe('uncalculation', () => {
    beforeEach(() => {
      component.match = mockMatch;
      component.resultDetails = [
        { ...mockResultDetail, resourceId: ResourceID.FullTime, checked: true },
        { ...mockResultDetail, resourceId: ResourceID.Final, checked: true }
      ];
      component.matchDetail = { ...mockMatchDetail, leagueType: LeagueType.OtPenalty };
      jest.spyOn(component as any, 'sendRequest');
    });

    it('should show confirmation dialog and send uncalculate request', () => {
      // Arrange
      let confirmCallback: Function;
      mockMessageBoxService.confirm.mockImplementation((message, callback) => {
        confirmCallback = callback;
      });

      // Act
      component.uncalculation();
      confirmCallback();

      // Assert
      expect(mockToastrService.clear).toHaveBeenCalled();
      expect(component.match.isClickOnCalculate).toBe(false);
      expect(component.confirmationDialogMessage.message).toBe(Language.UncalculationConfirmMessage);
      expect(component['sendRequest']).toHaveBeenCalled();
    });
  });

  describe('verifyAndAutoFillScore', () => {
    beforeEach(() => {
      component.resultDetails = [mockResultDetail];
      component.confirmResultDetails = [];
      component.providerResultDetails = [];
      mockResultDetailsService.resetHomeAwayValue.mockReturnValue(undefined);
      mockResultDetailsService.calcMatchResultDetails.mockReturnValue([mockResultDetail]);
      mockValidationService.verifyResultChanged.mockReturnValue(undefined);
      jest.spyOn(component as any, 'disabledInputResult');
    });

    it('should process result details and verify changes', () => {
      // Act
      component.verifyAndAutoFillScore(mockResultDetail);

      // Assert
      expect(component['disabledInputResult']).toHaveBeenCalled();
      expect(mockResultDetailsService.resetHomeAwayValue).toHaveBeenCalledWith(component.resultDetails);
      expect(mockResultDetailsService.calcMatchResultDetails).toHaveBeenCalledWith(component.resultDetails);
      expect(mockValidationService.verifyResultChanged).toHaveBeenCalled();
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle null match in initialData', () => {
      // Arrange
      component.match = null;

      // Act & Assert
      expect(() => component['initialData']()).not.toThrow();
    });

    it('should handle null resultDetails in viewData', () => {
      // Arrange
      component.resultDetails = null;

      // Act & Assert
      expect(() => component['viewData']()).not.toThrow();
    });

    it('should handle null matchDetail in isCompletedOrConfirmScore', () => {
      // Act & Assert
      expect(() => component['isCompletedOrConfirmScore'](null)).not.toThrow();
    });

    it('should handle empty selectedResults in calculation', () => {
      // Arrange
      component.resultDetails = [];

      // Act & Assert
      expect(() => component.calculation()).not.toThrow();
    });

    it('should handle null externalResult in copyScore', () => {
      // Arrange
      component.externalResult = null;
      component.providerResultDetails = [];

      // Act & Assert
      expect(() => component.copyScore()).not.toThrow();
    });
  });
});
