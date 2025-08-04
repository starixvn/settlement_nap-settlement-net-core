import { TestBed } from '@angular/core/testing';
import { VerificationResultsService } from './verify-results.service';
import { ResultDetail } from '../../shared/models/sportsbook-sop/result-detail.model';
import { ResourceIds, ScoreSourceType } from '../../shared/constants';
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';

describe('VerificationResultsService', () => {
  let service: VerificationResultsService;
  let mockResultByTeamNamePipe: jest.Mocked<ResultByTeamNamePipe>;

  beforeEach(() => {
    mockResultByTeamNamePipe = {
      transform: jest.fn().mockReturnValue('Test Team')
    } as any;

    TestBed.configureTestingModule({
      providers: [
        VerificationResultsService,
        { provide: ResultByTeamNamePipe, useValue: mockResultByTeamNamePipe }
      ]
    });
    service = TestBed.inject(VerificationResultsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('allMapHaveScreenshotSource', () => {
    it('should return true when all maps have screenshot source', () => {
      const mockResultDetails: ResultDetail[] = [
        {
          resourceId: 'inning01',
          externalScores: [
            { sourceId: ScoreSourceType.screenshot, homeValue: '1', awayValue: '0' }
          ]
        } as ResultDetail
      ];

      const result = service.allMapHaveScreenshotSource(mockResultDetails);

      expect(result).toBe(true);
    });

    it('should return true when map has extra sources', () => {
      const mockResultDetails: ResultDetail[] = [
        {
          resourceId: ResourceIds.extraInning,
          externalScores: []
        } as ResultDetail
      ];

      const result = service.allMapHaveScreenshotSource(mockResultDetails);

      expect(result).toBe(true);
    });

    it('should return false when map has no screenshot source and no extra sources', () => {
      const mockResultDetails: ResultDetail[] = [
        {
          resourceId: 'inning01',
          externalScores: []
        } as ResultDetail
      ];

      const result = service.allMapHaveScreenshotSource(mockResultDetails);

      expect(result).toBe(false);
    });
  });

  describe('allMapHaveScoreSources', () => {
    it('should return true when all maps have score sources', () => {
      const mockResultDetails: ResultDetail[] = [
        {
          resourceId: 'inning01',
          externalScores: [
            { sourceId: ScoreSourceType.trader, homeValue: '1', awayValue: '0' },
            { sourceId: ScoreSourceType.screenshot, homeValue: '1', awayValue: '0' }
          ]
        } as ResultDetail
      ];

      const result = service.allMapHaveScoreSources(mockResultDetails);

      expect(result).toBe(true);
    });

    it('should return true when map has extra sources', () => {
      const mockResultDetails: ResultDetail[] = [
        {
          resourceId: ResourceIds.extraInning,
          externalScores: []
        } as ResultDetail
      ];

      const result = service.allMapHaveScoreSources(mockResultDetails);

      expect(result).toBe(true);
    });

    it('should return false when map has no score sources and no extra sources', () => {
      const mockResultDetails: ResultDetail[] = [
        {
          resourceId: 'inning01',
          externalScores: []
        } as ResultDetail
      ];

      const result = service.allMapHaveScoreSources(mockResultDetails);

      expect(result).toBe(false);
    });
  });
}); 