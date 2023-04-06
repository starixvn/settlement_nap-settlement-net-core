
import { CashOutService } from "./cash-out.service";
import { TestBed, getTestBed } from '@angular/core/testing';
import { ResultDetail } from "../models";
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../shared/services';
import { HttpClientModule } from '@angular/common/http';
describe('CashOutService', () => {
    let service: CashOutService;
    let httpRequestService: HttpRequestService;
    let injector: TestBed;
    const cashOutApi = '/api/cash-out';
  

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                CashOutService,
                HttpRequestService,
                BlockUIService,
                MessageBoxService,
            ],
            imports: [
                HttpClientModule,
            ],
        });
        
        injector = getTestBed();
        service = injector.inject(CashOutService);
        httpRequestService = TestBed.inject(HttpRequestService);
    });

    it('should create a service', () => {
        expect(service).toBeTruthy();
    });

    
    it('getTicketInfo - Should call right api url', () => {
        // Arrange
        const expectedUrl = `${cashOutApi}/get-ticket`;
        const query = new Object();

        // Act
        jest.spyOn(httpRequestService, 'postJson');
        service.getTicketInfo(query);

        // Assert
        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, expectedUrl);
    });

    it('voidBet - Should call right api url', () => {
        // Arrange
        const expectedUrl = `${cashOutApi}/void-bet`;
        const query = new Object();

        // Act
        jest.spyOn(httpRequestService, 'postJson');
        service.voidBet(query);

        // Assert
        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, expectedUrl);
    });

    it('calc - Should call right api url', () => {
        // Arrange
        const expectedUrl = `${cashOutApi}/calc`;
        const query = new Object();

        // Act
        jest.spyOn(httpRequestService, 'postJson');
        service.calc(query);

        // Assert
        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, expectedUrl);
    });

    it('refund - Should call right api url', () => {
        // Arrange
        const expectedUrl = `${cashOutApi}/refund`;
        const query = new Object();

        // Act
        jest.spyOn(httpRequestService, 'postJson');
        service.refund(query);

        // Assert
        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, expectedUrl);
    });

    describe('getHalf', () => {
        let resultDetails: ResultDetail[] = [];
        const quarter1 = new ResultDetail("Q1", "1", "1", false);
        const quarter2 = new ResultDetail("Q2", "2", "2", false);
        const quarter3 = new ResultDetail("Q3", "3", "3", false);
        const quarter4 = new ResultDetail("Q4", "4", "4", false);
        const halfTime = new ResultDetail("01", "11", "11", false);
        const fullTime = new ResultDetail("00", "22", "22", false);

        it('Should return 1', () => {
            quarter1.checked = true;
            resultDetails = [quarter1, quarter2, quarter3, quarter4, halfTime, fullTime];

            const result = service.getHalf(resultDetails);
            expect(result).toEqual(1);
        });

        it('Should return 2', () => {
            quarter1.checked = false;
            quarter2.checked = true;
            resultDetails = [quarter1, quarter2, quarter3, quarter4, halfTime, fullTime];

            const result = service.getHalf(resultDetails);
            expect(result).toEqual(2);
        });

        it('Should return 3', () => {
            quarter2.checked = false;
            quarter3.checked = true;
            resultDetails = [quarter1, quarter2, quarter3, quarter4, halfTime, fullTime];
            

            const result = service.getHalf(resultDetails);
            expect(result).toEqual(3);
        });

        it('Should return 4', () => {
            quarter3.checked = false;
            quarter4.checked = true;
            resultDetails = [quarter1, quarter2, quarter3, quarter4, halfTime, fullTime];

            const result = service.getHalf(resultDetails);
            expect(result).toEqual(4);
        });

        it('Should return 5', () => {
            quarter4.checked = false;
            halfTime.checked = true;
            resultDetails = [quarter1, quarter2, quarter3, quarter4, halfTime, fullTime];

            const result = service.getHalf(resultDetails);
            expect(result).toEqual(5);
        });

        it('Should return 0', () => {
            halfTime.checked = false;
            fullTime.checked = true;
            resultDetails = [quarter1, quarter2, quarter3, quarter4, halfTime, fullTime];

            const result = service.getHalf(resultDetails);
            expect(result).toEqual(0);
        });
    });

    describe('getBetStatus', () => {
        let resultDetails: ResultDetail[] = [];
        const quarter1 = new ResultDetail("Q1", "1", "1", false);
        const quarter2 = new ResultDetail("Q2", "2", "2", true);
        const quarter3 = new ResultDetail("Q3", "3", "3", true);
        const quarter4 = new ResultDetail("Q4", "4", "4", true);
        const halfTime = new ResultDetail("01", "11", "11", true);
        const fullTime = new ResultDetail("00", "22", "22", true);

        it('Refund Quarter 2 - Should return right expected betstatus value', () => {
            resultDetails = [quarter1, quarter2, quarter3, quarter4, halfTime, fullTime];

            const result = service.getBetStatus(resultDetails);
            expect(result).toEqual("1-1,0-0,0-0,0-0,0-0");
        });

        it('Refund Quarter 1 - Should return right expected betstatus value', () => {
            quarter1.checked = true;
            resultDetails = [quarter1, quarter2, quarter3, quarter4, halfTime, fullTime];

            const result = service.getBetStatus(resultDetails);
            expect(result).toEqual("0-0,0-0,0-0,0-0,0-0");
        });
    });
});