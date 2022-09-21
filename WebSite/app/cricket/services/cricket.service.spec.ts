import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { HttpRequestService, BlockUIService, MessageBoxService } from '../../shared/services';
import { CricketService } from '.';
import { CalculateAction } from '../../shared/constants';
import { NetPositionQuery } from '../models';
import { ResultNameByIdPipe } from '../pipes';
import { MatchDetail } from '../../shared/models/sportsbook-sop/match-detail.model';
import { ResultCommand } from '../../shared/models';

describe('CricketService', () => {
    let service: CricketService = null;
    let httpRequestService: HttpRequestService;
    let resultNameByIdPipe: ResultNameByIdPipe
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                CricketService,
                HttpRequestService,
                BlockUIService,
                MessageBoxService,
                ResultNameByIdPipe,
            ],
            imports: [
                HttpClientModule,
            ],
        });

        service = TestBed.inject(CricketService);
        httpRequestService = TestBed.inject(HttpRequestService);
        resultNameByIdPipe = TestBed.inject(ResultNameByIdPipe);

    });

    beforeEach(inject([CricketService], (cricketService: CricketService) => {
        service = cricketService;
        service.rootUrl = 'Local';
    }));

    it('should create a service', () => {
        expect(service).toBeTruthy();
    });

    describe('net position', () => {
        it('should call right apiUrl for uncalculate', fakeAsync(() => {
            const url = 'Local/settlement/net-position/uncalculate';
            const action = CalculateAction.unCalculate
            const query: NetPositionQuery = {
                action,
                matchId: 100,
                isCallNPService: true,
                resultCommand: [new ResultCommand]
            };

            spyOn(httpRequestService, 'postJson');
            service.netPosition(query);
            tick();

            // Assert
            expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url, true);
        }));

        it('should call right apiUrl for calculate', fakeAsync(() => {
            const url = 'Local/settlement/net-position/calculate';
            const action = CalculateAction.calculate
            const query: NetPositionQuery = {
                action,
                matchId: 100,
                isCallNPService: false,
                resultCommand: [new ResultCommand]
            };

            spyOn(httpRequestService, 'postJson');
            service.netPosition(query);
            tick();

            // Assert
            expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url, true);
        }));
    });

    it('resultNameById - should call pipe', () => {
        spyOn(resultNameByIdPipe, 'transform');

        service.resultNameById("", new MatchDetail());

        expect(resultNameByIdPipe.transform).toHaveBeenCalled();
    });
});
