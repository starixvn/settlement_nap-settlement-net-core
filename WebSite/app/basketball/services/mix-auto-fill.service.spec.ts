import { TestBed } from '@angular/core/testing';
import { MixAutoFillService } from './mix-auto-fill.service';
import { ResultDetail } from '../../shared/models/sportsbook-sop';

describe('MixAutoFillService', () => {
  let service: MixAutoFillService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MixAutoFillService]
    });
    service = TestBed.inject(MixAutoFillService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('autoFillMixReboundsAssists', () => {
    it('should calculate Rebounds-Assists when Rebounds changes', () => {
      // Arrange
      const reboundsResult = new ResultDetail();
      reboundsResult.betType = '656'; // Rebounds
      reboundsResult.resourceId = 'M1';
      reboundsResult.homeValue = '5';

      const assistsResult = new ResultDetail();
      assistsResult.betType = '659'; // Assists
      assistsResult.resourceId = 'M1';
      assistsResult.homeValue = '3';

      const reboundsAssistsResult = new ResultDetail();
      reboundsAssistsResult.betType = '671'; // Rebounds-Assists
      reboundsAssistsResult.resourceId = 'M1';
      reboundsAssistsResult.homeValue = '0';

      const resultDetails = [reboundsResult, assistsResult, reboundsAssistsResult];

      // Act
      service.autoFillMixReboundsAssists(resultDetails, reboundsResult);

      // Assert
      expect(reboundsAssistsResult.homeValue).toBe('8'); // 5 + 3
      expect((reboundsAssistsResult as any).isAutoCalculated).toBe(true);
    });

    it('should calculate Rebounds-Assists when Assists changes', () => {
      // Arrange
      const reboundsResult = new ResultDetail();
      reboundsResult.betType = '656'; // Rebounds
      reboundsResult.resourceId = 'M1';
      reboundsResult.homeValue = '4';

      const assistsResult = new ResultDetail();
      assistsResult.betType = '659'; // Assists
      assistsResult.resourceId = 'M1';
      assistsResult.homeValue = '6';

      const reboundsAssistsResult = new ResultDetail();
      reboundsAssistsResult.betType = '671'; // Rebounds-Assists
      reboundsAssistsResult.resourceId = 'M1';
      reboundsAssistsResult.homeValue = '0';

      const resultDetails = [reboundsResult, assistsResult, reboundsAssistsResult];

      // Act
      service.autoFillMixReboundsAssists(resultDetails, assistsResult);

      // Assert
      expect(reboundsAssistsResult.homeValue).toBe('10'); // 4 + 6
      expect((reboundsAssistsResult as any).isAutoCalculated).toBe(true);
    });

    it('should not calculate if betType is not Rebounds or Assists', () => {
      // Arrange
      const otherResult = new ResultDetail();
      otherResult.betType = '999'; // Other bet type
      otherResult.resourceId = 'M1';
      otherResult.homeValue = '5';

      const reboundsAssistsResult = new ResultDetail();
      reboundsAssistsResult.betType = '671'; // Rebounds-Assists
      reboundsAssistsResult.resourceId = 'M1';
      reboundsAssistsResult.homeValue = '0';

      const resultDetails = [otherResult, reboundsAssistsResult];

      // Act
      service.autoFillMixReboundsAssists(resultDetails, otherResult);

      // Assert
      expect(reboundsAssistsResult.homeValue).toBe('0'); // Should not change
      expect((reboundsAssistsResult as any).isAutoCalculated).toBeFalsy();
    });

    it('should handle empty values correctly', () => {
      // Arrange
      const reboundsResult = new ResultDetail();
      reboundsResult.betType = '656'; // Rebounds
      reboundsResult.resourceId = 'M1';
      reboundsResult.homeValue = '';

      const assistsResult = new ResultDetail();
      assistsResult.betType = '659'; // Assists
      assistsResult.resourceId = 'M1';
      assistsResult.homeValue = '3';

      const reboundsAssistsResult = new ResultDetail();
      reboundsAssistsResult.betType = '671'; // Rebounds-Assists
      reboundsAssistsResult.resourceId = 'M1';
      reboundsAssistsResult.homeValue = '0';

      const resultDetails = [reboundsResult, assistsResult, reboundsAssistsResult];

      // Act
      service.autoFillMixReboundsAssists(resultDetails, reboundsResult);

      // Assert
      expect(reboundsAssistsResult.homeValue).toBe('3'); // 0 + 3
      expect((reboundsAssistsResult as any).isAutoCalculated).toBe(true);
    });

    it('should handle invalid numeric values', () => {
      // Arrange
      const reboundsResult = new ResultDetail();
      reboundsResult.betType = 656; // Rebounds
      reboundsResult.resourceId = 'M1';
      reboundsResult.playerName = 'Lou Williams';
      reboundsResult.homeValue = 'abc';

      const assistsResult = new ResultDetail();
      assistsResult.betType = 659; // Assists
      assistsResult.resourceId = 'M1';
      assistsResult.playerName = 'Lou Williams';
      assistsResult.homeValue = '4';

      const reboundsAssistsResult = new ResultDetail();
      reboundsAssistsResult.betType = 671; // Rebounds-Assists
      reboundsAssistsResult.resourceId = 'M1';
      reboundsAssistsResult.playerName = 'Lou Williams';
      reboundsAssistsResult.homeValue = '0';

      const resultDetails = [reboundsResult, assistsResult, reboundsAssistsResult];

      // Act
      service.autoFillMixReboundsAssists(resultDetails, reboundsResult);

      // Assert
      expect(reboundsAssistsResult.homeValue).toBe('4'); // 0 + 4
      expect(reboundsAssistsResult.isAutoCalculated).toBe(true);
    });
  });

  describe('onResultDetailChanged', () => {
    it('should call autoFillMixReboundsAssists when result is checked and not auto-calculated', () => {
      // Arrange
      const resultDetail = new ResultDetail();
      resultDetail.betType = 656; // Rebounds
      resultDetail.checked = true;
      resultDetail.isAutoCalculated = false;

      const resultDetails = [resultDetail];

      spyOn(service, 'autoFillMixReboundsAssists');

      // Act
      service.onResultDetailChanged(resultDetails, resultDetail);

      // Assert
      expect(service.autoFillMixReboundsAssists).toHaveBeenCalledWith(resultDetails, resultDetail);
    });

    it('should not call autoFillMixReboundsAssists when result is not checked', () => {
      // Arrange
      const resultDetail = new ResultDetail();
      resultDetail.betType = 656; // Rebounds
      resultDetail.checked = false;
      resultDetail.isAutoCalculated = false;

      const resultDetails = [resultDetail];

      spyOn(service, 'autoFillMixReboundsAssists');

      // Act
      service.onResultDetailChanged(resultDetails, resultDetail);

      // Assert
      expect(service.autoFillMixReboundsAssists).not.toHaveBeenCalled();
    });

    it('should not call autoFillMixReboundsAssists when result is auto-calculated', () => {
      // Arrange
      const resultDetail = new ResultDetail();
      resultDetail.betType = 656; // Rebounds
      resultDetail.checked = true;
      resultDetail.isAutoCalculated = true;

      const resultDetails = [resultDetail];

      spyOn(service, 'autoFillMixReboundsAssists');

      // Act
      service.onResultDetailChanged(resultDetails, resultDetail);

      // Assert
      expect(service.autoFillMixReboundsAssists).not.toHaveBeenCalled();
    });
  });

  describe('onReboundsChanged', () => {
    it('should call autoFillMixReboundsAssists when betType is 656', () => {
      // Arrange
      const reboundsResult = new ResultDetail();
      reboundsResult.betType = 656; // Rebounds
      const resultDetails = [reboundsResult];

      spyOn(service, 'autoFillMixReboundsAssists');

      // Act
      service.onReboundsChanged(resultDetails, reboundsResult);

      // Assert
      expect(service.autoFillMixReboundsAssists).toHaveBeenCalledWith(resultDetails, reboundsResult);
    });

    it('should not call autoFillMixReboundsAssists when betType is not 656', () => {
      // Arrange
      const otherResult = new ResultDetail();
      otherResult.betType = 999; // Other bet type
      const resultDetails = [otherResult];

      spyOn(service, 'autoFillMixReboundsAssists');

      // Act
      service.onReboundsChanged(resultDetails, otherResult);

      // Assert
      expect(service.autoFillMixReboundsAssists).not.toHaveBeenCalled();
    });
  });

  describe('onAssistsChanged', () => {
    it('should call autoFillMixReboundsAssists when betType is 659', () => {
      // Arrange
      const assistsResult = new ResultDetail();
      assistsResult.betType = 659; // Assists
      const resultDetails = [assistsResult];

      spyOn(service, 'autoFillMixReboundsAssists');

      // Act
      service.onAssistsChanged(resultDetails, assistsResult);

      // Assert
      expect(service.autoFillMixReboundsAssists).toHaveBeenCalledWith(resultDetails, assistsResult);
    });

    it('should not call autoFillMixReboundsAssists when betType is not 659', () => {
      // Arrange
      const otherResult = new ResultDetail();
      otherResult.betType = 999; // Other bet type
      const resultDetails = [otherResult];

      spyOn(service, 'autoFillMixReboundsAssists');

      // Act
      service.onAssistsChanged(resultDetails, otherResult);

      // Assert
      expect(service.autoFillMixReboundsAssists).not.toHaveBeenCalled();
    });
  });
});
