import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { BasketballService } from './basketball.service';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../shared/services';
import * as _ from 'lodash';
import { SettlementStatusId } from '../../shared/constants';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { ResourceNameByIdPipe } from '../pipes/resource-name-by-id.pipe';
import { BetStatusService, VerificationService } from '.';

export class CreateDataTest {
    public static CreateResultDetail(
      resourceId: string,
      home: string,
      away: string,
      checked: boolean
    ) {
      const item = new ResultDetail();
      item.resourceId = resourceId;
      item.checked = checked;
      item.homeValue = home;
      item.awayValue = away;
      return item;
    }
  }

describe('Basketball - Basketball Service', () => {
    let service: BasketballService = null;
    let resultDetails: ResultDetail[] = [];
    const quarter1 = CreateDataTest.CreateResultDetail('Q1', '1', '2', false);
    const quarter2 = CreateDataTest.CreateResultDetail('Q2', '3', '4', false);
    const quarter3 = CreateDataTest.CreateResultDetail('Q3', '5', '6', false);
    const quarter4 = CreateDataTest.CreateResultDetail('Q4', '7', '8', true);
    const fullTime = CreateDataTest.CreateResultDetail('00', '', '', false);
    const halfTime = CreateDataTest.CreateResultDetail('01', '', '', true);
    const ot = CreateDataTest.CreateResultDetail('OT', '9', '10', false);
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                BasketballService,
                BlockUIService,
                MessageBoxService,
                IntervalBackgroundPipe,
                ResourceNameByIdPipe,
                HttpRequestService,
                BetStatusService,
                VerificationService
            ],
            imports: [
                HttpClientModule,
            ],
        });
    });

    beforeEach(inject([BasketballService], (basketballService: BasketballService) => {
        service = basketballService;
    }));

    it('should create a service', () => {
        expect(service).toBeTruthy();
    });

    it('getResultDetail - Should return resultDetail with correct position.', () => {
       resultDetails = [quarter1, halfTime, fullTime, ot, quarter4, quarter2, quarter3];
       const actualResultDetails = service.getResultDetail(resultDetails);
       const expectedResultDetails = [quarter1, quarter2, halfTime, quarter3, quarter4, ot, fullTime];
       expect(expectedResultDetails).toEqual(actualResultDetails);
    });

    it('getResultDetail - Should return resultDetail with correct position popup refund.', () => {
        resultDetails = [quarter1, halfTime, fullTime, ot, quarter4, quarter2, quarter3];
        const actualResultDetails = service.getResultDetail(resultDetails, false);
        const expectedResultDetails = [quarter1, quarter2, quarter3, quarter4, ot, halfTime, fullTime];
        expect(expectedResultDetails).toEqual(actualResultDetails);
     });

    it('should return true when all quarters with settlementStatusId = running.', () => {
        const q1 = _.clone(quarter1);
        q1.settlementStatusId = SettlementStatusId.Running;

        const q2 = _.clone(quarter2);
        q2.settlementStatusId = SettlementStatusId.Running;

        const ht = _.clone(halfTime);
        ht.settlementStatusId = SettlementStatusId.Running;
        ht.checked = false;

        const q3 = _.clone(quarter3);
        q3.settlementStatusId = SettlementStatusId.Running;

        const q4 = _.clone(quarter4);
        q4.settlementStatusId = SettlementStatusId.Running;
        q4.checked = false;

        const ft = _.clone(fullTime);
        ft.settlementStatusId = SettlementStatusId.Running;

        resultDetails = [q1, q2, ht, q3, q4, ft, ot];

        const result = service.isDisabledUndoButton(resultDetails);

        expect(result).toBe(true);
    });
});