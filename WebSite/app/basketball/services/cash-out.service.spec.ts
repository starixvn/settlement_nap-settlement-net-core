
import { CashOutService } from "./cash-out.service";
import { TestBed, getTestBed } from '@angular/core/testing';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../shared/services';
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { GenerateCashOutService } from "./generate-cash-out.service";

describe('CashOutService', () => {
    let service: CashOutService;
    let httpRequestService: HttpRequestService;
    let injector: TestBed;
    let generateCashOutService: GenerateCashOutService;
    const cashOutApi = '/api/cash-out';

    const quarter1 = new ResultDetail();
    quarter1.resourceId = "Q1";
    quarter1.homeValue = "1";
    quarter1.awayValue = "1";
    quarter1.checked = false;
    
    const quarter2 = new ResultDetail();
    quarter2.resourceId = "Q2";
    quarter2.homeValue = "2";
    quarter2.awayValue = "2";
    quarter2.checked = false;
    
    const quarter3 = new ResultDetail();
    quarter3.resourceId = "Q3";
    quarter3.homeValue = "3";
    quarter3.awayValue = "3";
    quarter3.checked = false;
    
    const quarter4 = new ResultDetail();
    quarter4.resourceId = "Q4";
    quarter4.homeValue = "4";
    quarter4.awayValue = "4";
    quarter4.checked = false;
    
    const halfTime = new ResultDetail();
    halfTime.resourceId = "01";
    halfTime.homeValue = "11";
    halfTime.awayValue = "11";
    halfTime.checked = false;
    
    const fullTime = new ResultDetail();
    fullTime.resourceId = "00";
    fullTime.homeValue = "22";
    fullTime.awayValue = "22";
    fullTime.checked = false;
  

    beforeEach(() => {
       TestBed.configureTestingModule({
            providers: [
                CashOutService,
                HttpRequestService,
                BlockUIService,
                MessageBoxService,
                GenerateCashOutService
            ],
            imports: [
                HttpClientModule,
                NgbModule
            ],
            teardown: {destroyAfterEach: false}
        }).compileComponents();
        
        injector = getTestBed();
        service = injector.inject(CashOutService);
        httpRequestService = TestBed.inject(HttpRequestService);
        generateCashOutService = TestBed.inject(GenerateCashOutService);
    });

    it('should create a service', () => {
        expect(service).toBeTruthy();
    });

    
    it('getTicketInfo - Should call right api url', async () => {
        // Arrange
        const expectedUrl = `${cashOutApi}/get-ticket`;
        const query = {} as object;

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
        beforeEach(() => {
            quarter1.checked = false;
            quarter2.checked = false;
            quarter3.checked = false;
            quarter4.checked = false;
            halfTime.checked = false;
            fullTime.checked = false;
        })
        let resultDetails: ResultDetail[] = [];
       
        it('Should return 1', () => {
            quarter1.checked = true;
            resultDetails = [quarter1, quarter2, quarter3, quarter4, halfTime, fullTime];

            const result = service.getHalf(resultDetails);
            expect(result).toEqual(-1);
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
        beforeEach(() => {
            quarter1.checked = false;
            quarter2.checked = false;
            quarter3.checked = false;
            quarter4.checked = false;
            halfTime.checked = false;
            fullTime.checked = false;
        })
        let resultDetails: ResultDetail[] = [];
        it('Refund Quarter 2 - Should return right expected betstatus value', () => {
            resultDetails = [quarter1, quarter2, quarter3, quarter4, halfTime, fullTime];

            const result = service.getBetStatus(resultDetails);
            expect(result).toEqual("1-1,2-2,3-3,4-4");
        });

        it('Refund Quarter 1 - Should return right expected betstatus value', () => {
            quarter1.checked = true;
            resultDetails = [quarter1, quarter2, quarter3, quarter4, halfTime, fullTime];

            const result = service.getBetStatus(resultDetails);
            expect(result).toEqual("0-0,2-2,3-3,4-4");
        });
    });
});