import { TestBed } from '@angular/core/testing';
import { MixDoubleDoubleCalculateService } from './mix-double-double-calculate.service';
import { MixCoreService } from './mix-core.service';
import { VerificationBaseService } from '../../core/services/verification-base.service';
import { ResultDetail, ExternalResultDetail } from '../../shared/models/sportsbook-sop';

describe('MixDoubleDoubleCalculateService', () => {
  let service: MixDoubleDoubleCalculateService;
  let mockMixCoreService: jest.Mocked<MixCoreService>;
  let mockVerificationService: jest.Mocked<VerificationBaseService>;

  beforeEach(() => {
    mockMixCoreService = {
      noneValue: 'None',
      hasValidHomeValue: jest.fn(),
    } as any;

    mockVerificationService = {
      isEarlyMismatchedWarning: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        MixDoubleDoubleCalculateService,
        { provide: MixCoreService, useValue: mockMixCoreService },
        { provide: VerificationBaseService, useValue: mockVerificationService },
      ],
    });

    service = TestBed.inject(MixDoubleDoubleCalculateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  function createMockResultDetail(
    resourceId: string,
    homeValue: string = '',
    relatedCalResources: string = '',
    externalScores: ExternalResultDetail[] = []
  ): ResultDetail {
    return {
      resourceId,
      homeValue,
      relatedCalResources,
      externalScores: externalScores.length > 0 ? externalScores : [{ homeValue: '', awayValue: '' } as any],
      checked: false,
      isScoreMismatched: false,
    } as ResultDetail;
  }

  function createMockExternalResultDetail(homeValue: string = ''): ExternalResultDetail {
    return {
      homeValue,
      awayValue: '',
    } as ExternalResultDetail;
  }

  describe('calculateDoubleDoubleValue', () => {
    it('should calculate Y when 2+ stats are greater than 9', () => {
      const resultDetails = [
        createMockResultDetail('R001', '15'),
        createMockResultDetail('R002', '12'),
      ];
      const doubleDoubleResult = createMockResultDetail('R003', '', 'R001,R002');

      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      service.calculateDoubleDoubleValue(resultDetails, doubleDoubleResult);

      expect(doubleDoubleResult.homeValue).toBe('Y');
      expect(doubleDoubleResult.checked).toBe(true);
    });

    it('should calculate N when 4+ stats are less than 10', () => {
      const resultDetails = [
        createMockResultDetail('R001', '5'),
        createMockResultDetail('R002', '3'),
        createMockResultDetail('R003', '2'),
        createMockResultDetail('R004', '1'),
      ];
      const doubleDoubleResult = createMockResultDetail('R005', '', 'R001,R002,R003,R004');

      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      service.calculateDoubleDoubleValue(resultDetails, doubleDoubleResult);

      expect(doubleDoubleResult.homeValue).toBe('N');
      expect(doubleDoubleResult.checked).toBe(true);
    });

    it('should calculate None when conditions are not met', () => {
      const resultDetails = [
        createMockResultDetail('R001', '8'),
        createMockResultDetail('R002', '7'),
      ];
      const doubleDoubleResult = createMockResultDetail('R003', '', 'R001,R002');

      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      service.calculateDoubleDoubleValue(resultDetails, doubleDoubleResult);

      expect(doubleDoubleResult.homeValue).toBe('None');
    });

    it('should set isScoreMismatched based on verification service', () => {
      const resultDetails = [
        createMockResultDetail('R001', '15'),
        createMockResultDetail('R002', '12'),
      ];
      const doubleDoubleResult = createMockResultDetail('R003', '', 'R001,R002');

      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(true);

      service.calculateDoubleDoubleValue(resultDetails, doubleDoubleResult);

      expect(doubleDoubleResult.isScoreMismatched).toBe(true);
    });
  });

  describe('calculateTripleDoubleValue', () => {
    it('should calculate Y when 3+ stats are greater than 9', () => {
      const resultDetails = [
        createMockResultDetail('R001', '15'),
        createMockResultDetail('R002', '12'),
        createMockResultDetail('R003', '11'),
      ];
      const tripleDoubleResult = createMockResultDetail('R004', '', 'R001,R002,R003');

      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      service.calculateTripleDoubleValue(resultDetails, tripleDoubleResult);

      expect(tripleDoubleResult.homeValue).toBe('Y');
      expect(tripleDoubleResult.checked).toBe(true);
    });

    it('should calculate N when 3+ stats are less than 10', () => {
      const resultDetails = [
        createMockResultDetail('R001', '5'),
        createMockResultDetail('R002', '3'),
        createMockResultDetail('R003', '2'),
      ];
      const tripleDoubleResult = createMockResultDetail('R004', '', 'R001,R002,R003');

      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      service.calculateTripleDoubleValue(resultDetails, tripleDoubleResult);

      expect(tripleDoubleResult.homeValue).toBe('N');
    });

    it('should calculate None when conditions are not met', () => {
      const resultDetails = [
        createMockResultDetail('R001', '8'),
        createMockResultDetail('R002', '7'),
      ];
      const tripleDoubleResult = createMockResultDetail('R003', '', 'R001,R002');

      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      service.calculateTripleDoubleValue(resultDetails, tripleDoubleResult);

      expect(tripleDoubleResult.homeValue).toBe('None');
    });
  });

  describe('updateExternalScores', () => {
    it('should update external scores for double double', () => {
      const resultDetails = [
        createMockResultDetail('R001', '15', '', [
          createMockExternalResultDetail('12'),
        ]),
        createMockResultDetail('R002', '12', '', [
          createMockExternalResultDetail('10'),
        ]),
      ];
      const doubleDoubleResult = createMockResultDetail('R003', '', 'R001,R002', [
        createMockExternalResultDetail(''),
      ]);

      mockMixCoreService.hasValidHomeValue.mockReturnValue(true);
      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      service.calculateDoubleDoubleValue(resultDetails, doubleDoubleResult);

      expect(doubleDoubleResult.externalScores[0].homeValue).toBe('Y');
    });

    it('should set external score to empty when all external scores are empty', () => {
      const resultDetails = [
        createMockResultDetail('R001', '15', '', [
          createMockExternalResultDetail(''),
        ]),
        createMockResultDetail('R002', '12', '', [
          createMockExternalResultDetail(''),
        ]),
      ];
      const doubleDoubleResult = createMockResultDetail('R003', '', 'R001,R002', [
        createMockExternalResultDetail(''),
      ]);

      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      service.calculateDoubleDoubleValue(resultDetails, doubleDoubleResult);

      expect(doubleDoubleResult.externalScores[0].homeValue).toBe('');
    });
  });

  describe('edge cases', () => {
    it('should handle empty homeValue', () => {
      const resultDetails = [
        createMockResultDetail('R001', ''),
        createMockResultDetail('R002', '12'),
      ];
      const doubleDoubleResult = createMockResultDetail('R003', '', 'R001,R002');

      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      service.calculateDoubleDoubleValue(resultDetails, doubleDoubleResult);

      expect(doubleDoubleResult.homeValue).toBe('None');
    });

    it('should handle invalid numeric homeValue', () => {
      const resultDetails = [
        createMockResultDetail('R001', 'invalid'),
        createMockResultDetail('R002', '12'),
      ];
      const doubleDoubleResult = createMockResultDetail('R003', '', 'R001,R002');

      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      service.calculateDoubleDoubleValue(resultDetails, doubleDoubleResult);

      expect(doubleDoubleResult.homeValue).toBe('None');
    });

    it('should handle resourceId not found', () => {
      const resultDetails = [
        createMockResultDetail('R001', '15'),
      ];
      const doubleDoubleResult = createMockResultDetail('R003', '', 'R001,R999');

      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      service.calculateDoubleDoubleValue(resultDetails, doubleDoubleResult);

      expect(doubleDoubleResult.homeValue).toBe('None');
    });
  });
});
