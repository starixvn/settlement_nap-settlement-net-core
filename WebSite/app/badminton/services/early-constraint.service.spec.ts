import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { HttpRequestService, BlockUIService, MessageBoxService } from '../../shared/services';
import { EarlyConstraintService } from './early-constraint.service';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { ResultSettingModel } from '../../shared/models';

describe('EarlyConstraintService', () => {
  let service: EarlyConstraintService = null;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EarlyConstraintService,
        HttpRequestService,
        BlockUIService,
        MessageBoxService,
      ],
      imports: [
        HttpClientModule,
      ],
    });
  });

  beforeEach(inject([EarlyConstraintService], (earlyConstraintService: EarlyConstraintService) => {
    service = earlyConstraintService;
  }));

  it('should create a service', () => {
    expect(service).toBeTruthy();
  });

  describe('getGroupMap', () => {
    const resultOne = new ResultDetail();
    const resultTwo = new ResultDetail();
    resultOne.map = 1;
    resultTwo.map = 2;
    resultOne.resultSettingData = new ResultSettingModel();
    resultTwo.resultSettingData = new ResultSettingModel();
    it('should return group map create by result map', () => {
      const actualResult = service.getGroupMap([resultOne, resultTwo]);

      expect(actualResult.length).toEqual(2);
    });

    it('should return group map with isHoldResult define by result hold setting', () => {
      resultOne.resultSettingData.isHoldResult = true;
      const actualResult = service.getGroupMap([resultOne, resultTwo]);

      expect(actualResult[0].isHoldResult).toBeTruthy();
      expect(actualResult[1].isHoldResult).toBeFalsy();
    });

  });
});
