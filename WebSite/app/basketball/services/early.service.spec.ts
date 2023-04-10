import { TestBed, getTestBed} from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EarlyService } from './early.service';
import { MessageBoxService } from '../../shared/services';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { ResultSettingModel } from '../../shared/models';
import { Language } from '../../shared/language.native';

describe('Basketball - Early Service', () => {
    let service: EarlyService = null;
    let injector: TestBed;
    let resultDetails = [];
    const resultDetail = new ResultDetail();
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                EarlyService,
                MessageBoxService,
                NgbModal
            ],
            imports: [
                HttpClientModule,
                NgbModule
            ]
        });

        injector = getTestBed();
        service = injector.inject(EarlyService);
    });

    it('should create a service', () => {
        expect(service).toBeTruthy();
    });

    describe('verifySelectCalculation', () => {
        it('should return error when selected result not confirmed.', async () => {
            const resultDetail1 = new ResultDetail();
            const resultDetail2 = new ResultDetail();
            resultDetail1.homeValue = "H";
            resultDetail1.resultSettingData = new ResultSettingModel();
            resultDetail1.resultSettingData.isConfirmedRefund = true;
            resultDetail2.homeValue = "A";

            const result = await service.verifyBeforeCalculation([resultDetail1, resultDetail2], true);

            expect(result).toEqual(Language.confirmRefund.calculateResultNotConfirmed);
        });

        it('should return false and isResultWarning = true when have empty result.', async () => {
            const resultDetail1 = new ResultDetail();
            const resultDetail2 = new ResultDetail();
            resultDetail1.resultSettingData = new ResultSettingModel();
            resultDetail2.resultSettingData = new ResultSettingModel();
            resultDetail1.homeValue = "",
            resultDetail1.checked = true;
            resultDetail2.homeValue = "A",
            resultDetail2.checked = true;

            const resultDetails = [resultDetail1, resultDetail2];
            const result = await service.verifyBeforeCalculation(resultDetails, true);

            expect(result).toEqual(Language.sop.leader.blankResult);
        });
    });

    it('getGroupMap - should group results by map', () => {
        const result1 = new ResultDetail();
        result1.groupName = '1';
        const result2 = new ResultDetail();
        result2.groupName = '1';
        const result3 = new ResultDetail();
        result3.groupName = '2';
        resultDetails = [result1, result2, result3];
        const resultSettingData = new ResultSettingModel();
        resultDetails.forEach(item => item.resultSettingData = resultSettingData);
        const maps = service.getGroupMap(resultDetails);

        expect(maps.length).toEqual(2);
    });

    it('isInValidResultValue - should return true when exist result warning', () => {
        resultDetail.isResultWarning = true;
        resultDetails = [resultDetail];

        const result = service.isInValidResultValue(resultDetails);

        expect(result).toBe(true);
    });

    it('verifyResultValueForBetType - should set warning for all results', () => {
        const coupleScore = new ResultDetail();
        coupleScore.inputType = 3;
        const other = new ResultDetail();
        other.inputType = 1;
        resultDetails = [coupleScore,  other];

        service.verifyResultValueForBetType(resultDetails);

        expect(coupleScore.isResultWarning).toBe(true);
        expect(other.isResultWarning).toBe(true);
    });
});