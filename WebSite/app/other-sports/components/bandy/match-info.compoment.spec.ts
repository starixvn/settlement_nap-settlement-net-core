import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatchInfoCompoment } from './match-info.compoment';
import { MatchDetail } from '../../models';
import { ResultDetail } from '../../../shared/models/sportsbook-sop/result-detail.model';
import { Permission } from '../../../shared/models/sportsbook-sop';
import { SettlementStatusId } from '../../../shared/constants/settlement-status-id.native';
import { BandyService } from './bandy.service';
import { ResultDetailsService } from './resultdetails.service';

describe('MatchInfoCompoment', () => {
  let component: MatchInfoCompoment;
  let fixture: ComponentFixture<MatchInfoCompoment>;
  let mockBandyService: jest.Mocked<BandyService>;
  let mockResultDetailsService: jest.Mocked<ResultDetailsService>;

  const mockMatchDetail: MatchDetail = {
    matchId: 12345,
    sportName: 'Bandy',
    sportType: 1,
    matchCode: 'BANDY123',
    kickOffTime: '2024-01-01T15:00:00Z',
    leagueName: 'Test League',
    homeName: 'Team A',
    awayName: 'Team B',
    playTime: 90,
    finalAwayScore: 1,
    finalHomeScore: 2,
    halfTimeHomeScore: 1,
    halfTimeAwayScore: 0,
    betStatus: 'active',
    isUnCalculate: false,
    ftStatus: 'completed',
    htStatus: 'completed',
    isFullTimeSettled: true,
    isHalfTimeSettled: true,
    confirmHT: 1,
    confirmFT: 1,
    eventStatus: 'completed',
    externalSourceName: 'Test Source',
    isCalculated: true,
    isRefund: false,
    isCalRefund: false,
    isHalfTimeCal: true,
    isScoreDirect: true,
    leagueType: 1,
    childMatchType: 0,
    parentId: 0
  } as MatchDetail;

  const mockResultDetail: ResultDetail = {
    resourceId: '01',
    resourceName: 'First Half',
    homeValue: '1',
    awayValue: '0',
    resultStatusId: 1,
    settlementStatusId: SettlementStatusId.Calculated,
    resultStatus: 'Calculated',
    isInvalidValue: false,
    isDisplayedForMember: false,
    checked: false,
    disabled: false,
    resultSettingData: null
  } as ResultDetail;

  const mockPermission: Permission = {
    isLeader: true
  } as Permission;

  beforeEach(async () => {
    const bandyServiceSpy = {
      getIntervalBackground: jest.fn()
    };

    const resultDetailsServiceSpy = {
      isShowScore: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        MatchInfoCompoment,
        HttpClientTestingModule
      ],
      providers: [
        { provide: BandyService, useValue: bandyServiceSpy },
        { provide: ResultDetailsService, useValue: resultDetailsServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MatchInfoCompoment);
    component = fixture.componentInstance;
    
    mockBandyService = TestBed.inject(BandyService) as jest.Mocked<BandyService>;
    mockResultDetailsService = TestBed.inject(ResultDetailsService) as jest.Mocked<ResultDetailsService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Properties', () => {
    it('should accept matchDetail input', () => {
      // Arrange
      component.matchDetail = mockMatchDetail;

      // Assert
      expect(component.matchDetail).toBe(mockMatchDetail);
    });

    it('should accept resultDetails input with default empty array', () => {
      // Assert
      expect(component.resultDetails).toEqual([]);
    });

    it('should accept resultDetails input with provided values', () => {
      // Arrange
      const resultDetails = [mockResultDetail];
      component.resultDetails = resultDetails;

      // Assert
      expect(component.resultDetails).toBe(resultDetails);
    });

    it('should accept showResultDetails input with default false', () => {
      // Assert
      expect(component.showResultDetails).toBe(false);
    });

    it('should accept showResultDetails input with provided value', () => {
      // Arrange
      component.showResultDetails = true;

      // Assert
      expect(component.showResultDetails).toBe(true);
    });

    it('should accept permission input', () => {
      // Arrange
      component.permission = mockPermission;

      // Assert
      expect(component.permission).toBe(mockPermission);
    });
  });


  describe('ngOnInit', () => {
    it('should not process resultDetails when showResultDetails is false', () => {
      // Arrange
      component.showResultDetails = false;
      component.resultDetails = [mockResultDetail];
      component.permission = mockPermission;

      // Act
      component.ngOnInit();

      // Assert
      expect(mockResultDetailsService.isShowScore).not.toHaveBeenCalled();
    });

    it('should process resultDetails when showResultDetails is true', () => {
      // Arrange
      component.showResultDetails = true;
      component.resultDetails = [mockResultDetail];
      component.permission = mockPermission;
      mockResultDetailsService.isShowScore.mockReturnValue(true);

      // Act
      component.ngOnInit();

      // Assert
      expect(mockResultDetailsService.isShowScore).toHaveBeenCalledWith(mockResultDetail, true);
      expect(mockResultDetail.isDisplayedForMember).toBe(true);
    });

    it('should set isDisplayedForMember to true when result has Refund settlement status', () => {
      // Arrange
      const refundResultDetail = {
        ...mockResultDetail,
        settlementStatusId: SettlementStatusId.Refund
      };
      component.showResultDetails = true;
      component.resultDetails = [refundResultDetail];
      component.permission = mockPermission;
      mockResultDetailsService.isShowScore.mockReturnValue(false);

      // Act
      component.ngOnInit();

      // Assert
      expect(refundResultDetail.isDisplayedForMember).toBe(true);
    });

    it('should handle null permission gracefully', () => {
      // Arrange
      component.showResultDetails = true;
      component.resultDetails = [mockResultDetail];
      component.permission = null;
      mockResultDetailsService.isShowScore.mockReturnValue(false);

      // Act
      component.ngOnInit();

      // Assert
      expect(mockResultDetailsService.isShowScore).toHaveBeenCalledWith(mockResultDetail, undefined);
    });

    it('should handle empty resultDetails array', () => {
      // Arrange
      component.showResultDetails = true;
      component.resultDetails = [];
      component.permission = mockPermission;

      // Act
      component.ngOnInit();

      // Assert
      expect(mockResultDetailsService.isShowScore).not.toHaveBeenCalled();
    });
  });

});
