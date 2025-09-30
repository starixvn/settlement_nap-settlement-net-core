import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { BandyCalculationComponent } from './calculation.component';
import { AioService, BlockUIService, MessageBoxService } from '../../../shared/services';
import { ResultDetailsService } from './resultdetails.service';
import { ValidationService } from './validation.service';
import { BandyService } from './bandy.service';
import { BetStatusService } from './betstatus.service';
import { MatchAio } from '../../models/match-aio.model';
import { ResultDetail, Permission, ExternalResult } from '../../../shared/models/sportsbook-sop';
import { ResourceID, LeagueType } from '../../constants';
import { ResultStatusId, SettlementStatusId } from '../../../shared/constants';
import { Language } from '../../../shared/language.native';

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


    it('should return className with interval background', () => {
      // Arrange
      const resultDetail = { ...mockResultDetail, settlementStatusId: 1 };
      mockBandyService.getIntervalBackground.mockReturnValue('refunded');

      // Act
      const result = component.getClassName(resultDetail);

      // Assert
      expect(result).toContain('refunded');
    });
  });

  describe('ngOnInit', () => {
    it('should initialize component properties', () => {
      // Act
      component.ngOnInit();

      // Assert
      expect(component.confirmationDialogMessage.title).toBe(Language.confirmationBox);
      expect(component.toastrService.overlayContainer).toBe(component.toastContainer);
    });
  });


  describe('existsConfirmedRefund', () => {
    beforeEach(() => {
      component.resultDetails = [
        { 
          ...mockResultDetail, 
          checked: true, 
          resultSettingData: { 
            isConfirmedRefund: true,
            isHoldResult: false,
            isConfirmedRefundSdt: false,
            isConfirmedRefundMercy: false,
            iconHoldResult: ''
          } as any
        },
        { 
          ...mockResultDetail, 
          checked: true, 
          resultSettingData: { 
            isConfirmedRefund: false,
            isHoldResult: false,
            isConfirmedRefundSdt: false,
            isConfirmedRefundMercy: false,
            iconHoldResult: ''
          } as any
        }
      ];
    });

    it('should return true when confirmed refund exists in selected results', () => {
      // Act
      const result = component.existsConfirmedRefund();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when no confirmed refund in selected results', () => {
      // Arrange
      component.resultDetails.forEach(result => {
        result.resultSettingData.isConfirmedRefund = false;
      });

      // Act
      const result = component.existsConfirmedRefund();

      // Assert
      expect(result).toBe(false);
    });
  });

});
