import { TestBed } from '@angular/core/testing';
import { MixHeadHeadCalculateService } from './mix-head-head.service.calculate';
import { MixCoreService } from './mix-core.service';
import { VerificationBaseService } from '../../core/services/verification-base.service';
import { ResultDetail, ExternalResultDetail } from '../../shared/models/sportsbook-sop';

describe('MixHeadHeadCalculateService', () => {
  let service: MixHeadHeadCalculateService;
  let mockMixCoreService: jest.Mocked<MixCoreService>;
  let mockVerificationService: jest.Mocked<VerificationBaseService>;

  beforeEach(() => {
    mockMixCoreService = {
      noneValue: 'None',
      findResultsByBetTypes: jest.fn(),
      hasAnyRefundedResult: jest.fn(),
    } as any;

    mockVerificationService = {
      isEarlyMismatchedWarning: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        MixHeadHeadCalculateService,
        { provide: MixCoreService, useValue: mockMixCoreService },
        { provide: VerificationBaseService, useValue: mockVerificationService },
      ],
    });

    service = TestBed.inject(MixHeadHeadCalculateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  function createMockResultDetail(
    resourceId: string,
    homeValue: string = '',
    playerId: number = 1,
    externalScores: ExternalResultDetail[] = []
  ): ResultDetail {
    return {
      resourceId,
      homeValue,
      externalScores: externalScores.length > 0 ? externalScores : [{ homeValue: '', awayValue: '' } as any],
      oddFlex: [
        {
          betChoice: `choice_${playerId}`,
          info: {
            playerId: playerId,
            playerName: `Player ${playerId}`,
          },
        },
      ] as any,
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

  function createMockMixResult(
    relatedCalResources: string,
    player1Id: number = 1,
    player2Id: number = 2
  ): ResultDetail {
    return {
      resourceId: 'MIX001',
      relatedCalResources,
      homeValue: '',
      oddFlex: [
        {
          betChoice: 'choice_1',
          info: {
            playerId: player1Id,
            playerName: 'Player 1',
          },
        },
        {
          betChoice: 'choice_2',
          info: {
            playerId: player2Id,
            playerName: 'Player 2',
          },
        },
      ] as any,
      externalScores: [
        createMockExternalResultDetail(''),
        createMockExternalResultDetail(''),
      ],
      checked: false,
      isScoreMismatched: false,
    } as ResultDetail;
  }

  describe('calculateMixHeadHeadValue', () => {

    it('should not calculate when less than 2 results found', () => {
      const player1 = createMockResultDetail('R001', '25', 1);
      const mixResult = createMockMixResult('R001,R002', 1, 2);
      const resultDetails = [player1];

      mockMixCoreService.findResultsByBetTypes.mockReturnValue([player1]);
      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      service.calculateMixHeadHeadValue(resultDetails, mixResult);

      expect(mixResult.homeValue).toBe('');
      expect(mixResult.checked).toBe(true);
    });

    it('should not calculate when more than 2 results found', () => {
      const player1 = createMockResultDetail('R001', '25', 1);
      const player2 = createMockResultDetail('R002', '20', 2);
      const player3 = createMockResultDetail('R003', '15', 3);
      const mixResult = createMockMixResult('R001,R002,R003', 1, 2);
      const resultDetails = [player1, player2, player3];

      mockMixCoreService.findResultsByBetTypes.mockReturnValue([player1, player2, player3]);
      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      service.calculateMixHeadHeadValue(resultDetails, mixResult);

      expect(mixResult.homeValue).toBe('');
      expect(mixResult.checked).toBe(true);
    });
  });

  describe('updateExternalScores', () => {
    it('should update external scores when both players have valid external scores', () => {
      const player1 = createMockResultDetail('R001', '25', 1, [
        createMockExternalResultDetail('12'),
        createMockExternalResultDetail('15'),
      ]);
      const player2 = createMockResultDetail('R002', '20', 2, [
        createMockExternalResultDetail('10'),
        createMockExternalResultDetail('8'),
      ]);
      const mixResult = createMockMixResult('R001,R002', 1, 2);
      mixResult.externalScores = [
        createMockExternalResultDetail(''),
        createMockExternalResultDetail(''),
      ];
      const resultDetails = [player1, player2];

      mockMixCoreService.findResultsByBetTypes.mockReturnValue([player1, player2]);
      mockMixCoreService.hasAnyRefundedResult.mockReturnValue(false);
      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      service.calculateMixHeadHeadValue(resultDetails, mixResult);

      expect(mixResult.externalScores[0].homeValue).toBe('choice_1'); // 12 > 10
      expect(mixResult.externalScores[1].homeValue).toBe('choice_1'); // 15 > 8
    });

    it('should set external score to empty when player1 external score is empty', () => {
      const player1 = createMockResultDetail('R001', '25', 1, [
        createMockExternalResultDetail(''),
      ]);
      const player2 = createMockResultDetail('R002', '20', 2, [
        createMockExternalResultDetail('10'),
      ]);
      const mixResult = createMockMixResult('R001,R002', 1, 2);
      mixResult.externalScores = [createMockExternalResultDetail('')];
      const resultDetails = [player1, player2];

      mockMixCoreService.findResultsByBetTypes.mockReturnValue([player1, player2]);
      mockMixCoreService.hasAnyRefundedResult.mockReturnValue(false);
      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      service.calculateMixHeadHeadValue(resultDetails, mixResult);

      expect(mixResult.externalScores[0].homeValue).toBe('');
    });

    it('should set external score to empty when player2 external score is empty', () => {
      const player1 = createMockResultDetail('R001', '25', 1, [
        createMockExternalResultDetail('12'),
      ]);
      const player2 = createMockResultDetail('R002', '20', 2, [
        createMockExternalResultDetail(''),
      ]);
      const mixResult = createMockMixResult('R001,R002', 1, 2);
      mixResult.externalScores = [createMockExternalResultDetail('')];
      const resultDetails = [player1, player2];

      mockMixCoreService.findResultsByBetTypes.mockReturnValue([player1, player2]);
      mockMixCoreService.hasAnyRefundedResult.mockReturnValue(false);
      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      service.calculateMixHeadHeadValue(resultDetails, mixResult);

      expect(mixResult.externalScores[0].homeValue).toBe('');
    });

    it('should return None when external scores are equal', () => {
      const player1 = createMockResultDetail('R001', '25', 1, [
        createMockExternalResultDetail('10'),
      ]);
      const player2 = createMockResultDetail('R002', '20', 2, [
        createMockExternalResultDetail('10'),
      ]);
      const mixResult = createMockMixResult('R001,R002', 1, 2);
      mixResult.externalScores = [createMockExternalResultDetail('')];
      const resultDetails = [player1, player2];

      mockMixCoreService.findResultsByBetTypes.mockReturnValue([player1, player2]);
      mockMixCoreService.hasAnyRefundedResult.mockReturnValue(false);
      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      service.calculateMixHeadHeadValue(resultDetails, mixResult);

      expect(mixResult.externalScores[0].homeValue).toBe('None');
    });

    it('should handle missing externalScores array', () => {
      const player1 = createMockResultDetail('R001', '25', 1);
      const player2 = createMockResultDetail('R002', '20', 2);
      const mixResult = createMockMixResult('R001,R002', 1, 2);
      mixResult.externalScores = [];
      const resultDetails = [player1, player2];

      mockMixCoreService.findResultsByBetTypes.mockReturnValue([player1, player2]);
      mockMixCoreService.hasAnyRefundedResult.mockReturnValue(false);
      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      expect(() => {
        service.calculateMixHeadHeadValue(resultDetails, mixResult);
      }).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle missing oddFlex in player result', () => {
      const player1 = createMockResultDetail('R001', '25', 1);
      const player2 = createMockResultDetail('R002', '20', 2);
      player2.oddFlex = [] as any;
      const mixResult = createMockMixResult('R001,R002', 1, 2);
      const resultDetails = [player1, player2];

      mockMixCoreService.findResultsByBetTypes.mockReturnValue([player1, player2]);
      mockMixCoreService.hasAnyRefundedResult.mockReturnValue(false);
      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      // This will throw because getPlayerIdWinner accesses oddFlex[0]
      expect(() => {
        service.calculateMixHeadHeadValue(resultDetails, mixResult);
      }).toThrow();
    });
  });
});
