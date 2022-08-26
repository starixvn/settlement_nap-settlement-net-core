import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { MatchSettingService, RequestService } from './';
import { HttpRequestService, BlockUIService, MessageBoxService } from '../../shared/services';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatchDetail, AutoSetting } from '../models';
import { of } from 'rxjs';

describe('BetBuilder - Match setting Service', () => {
    let service: MatchSettingService = null;
    let requestService: RequestService;
    let messageBoxService: MessageBoxService;

    const errorMessage = "Error message";
    const successfulResult = {
        errCode: 0,
        errMsg: "",
        isSuccessful: true,
    };

    const unSuccessfulResult = {
        errCode: 1,
        errMsg: errorMessage,
        isSuccessful: false,
    };
    const mockMatch = new MatchDetail();
    mockMatch.autoCalcSetting = new  AutoSetting();

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                MatchSettingService,
                HttpRequestService,
                BlockUIService,
                MessageBoxService,
                RequestService
            ],
            imports: [
                HttpClientModule,
                NgbModule,
            ],
        });
    });

    beforeEach(inject([MatchSettingService], (matchSettingService: MatchSettingService) => {
        service = matchSettingService;
        requestService = TestBed.inject(RequestService);
        messageBoxService = TestBed.inject(MessageBoxService);
    }));

    it('should create a service', () => {
        expect(service).toBeTruthy();
    });
    describe('updateMatch', () => {
        it('should set right value isAutoSettingForMatch when update success', async() => {
            spyOn(requestService, 'updateMatch').and.returnValue(of(successfulResult));
            mockMatch.autoCalcSetting.isAutoSettingForMatch = true;

            await service.updateMatch(mockMatch);

            expect(mockMatch.autoCalcSetting.isAutoSettingForMatch).toBe(false);
        });

        it('should show alert when update request is unsuccess.', async() => {
            spyOn(requestService, 'updateMatch').and.returnValue(of(unSuccessfulResult));
            spyOn(messageBoxService , 'alert');

            await service.updateMatch(mockMatch);

            expect(messageBoxService.alert).toHaveBeenCalled();
        });
    });
});