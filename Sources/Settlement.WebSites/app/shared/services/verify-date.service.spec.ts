import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { VerifyDateService } from './';
import { HttpRequestService, BlockUIService, MessageBoxService } from '../../shared/services';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

describe('BetBuilder - Verify Filter Sevice', () => {
    let service: VerifyDateService = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                VerifyDateService,
                HttpRequestService,
                BlockUIService,
                MessageBoxService,
            ],
            imports: [
                HttpClientModule,
                NgbModule,
            ],
        });
    });

    beforeEach(inject([VerifyDateService], (verifyFilterService: VerifyDateService) => {
        service = verifyFilterService;
    }));

    it('should create a service', () => {
        expect(service).toBeTruthy();
    });

    it('should return expected date', () => {
        const value = "2019-03-15";

        const expected = {
            year: 2019,
            month: 3,
            day: 15
        };

        const result = service.convertToDateStruct(value);

        expect(expected).toEqual(result);
    });

    it('should return date format', () => {
        const value = {
            year: 2019,
            month: 3,
            day: 15
        };

        const result = service.dateFormat(value);
        const expectedDate = "2019-03-15";
        expect(expectedDate).toEqual(result);
    });

    it('should return true when todate greater than fromdate', () => {
        const fromDate = {
            year: 2019,
            month: 3,
            day: 15
        };

        const toDate = {
            year: 2019,
            month: 3,
            day: 16
        };

        const result = service.validDate(fromDate, toDate);
        expect(result).toBe(true);
    });
});