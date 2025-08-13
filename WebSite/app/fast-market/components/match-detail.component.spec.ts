import { TestBed, waitForAsync, ComponentFixture, fakeAsync, tick, flush } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ElementRef } from "@angular/core";
import { ModalDialogComponent } from '../../shared/components/modal-dialog/modal-dialog.component';
import { MatchDetailComponent } from './match-detail.component';
import { MatchDetail, AutoSettingIcon } from '../models';
import { MessageBoxService, HttpRequestService, BlockUIService } from '../../shared/services';
import { RequestService } from '../services/request.service';
import { UrlHelper } from '../../helper';
import { ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { MaterialModule } from '../../shared/material-module';
import { ModalContentDialogComponent } from '../../shared/components/modal-dialog/modal-content-dialog.component';

describe('Component: MatchDetailComponent', () => {
    let component: MatchDetailComponent;
    let fixture: ComponentFixture<MatchDetailComponent>;
    let fastMarketService: RequestService;
    let messageBoxService: MessageBoxService;
    let toastrService: ToastrService;
    const errorMessage = "Error message";
    const matchDetail = new MatchDetail();
    matchDetail.matchId = 700000;
    matchDetail.autoSettingIcon = new AutoSettingIcon();
    matchDetail.autoSettingIcon.match = 'icon-yes';
    matchDetail.autoSettingIcon.league = 'icon-no';
    matchDetail.matchAutoSettingTooltip = 'Click to turn off auto settlement of Fast Markets.';
    matchDetail.leagueAutoSettingTooltip = 'Click to turn on auto settlement of Fast Markets.';
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

    class MockElementRef implements ElementRef {
        nativeElement = {};
    }

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                MatchDetailComponent,
            ],
            providers: [
                HttpRequestService,
                BlockUIService,
                RequestService,
                NgbModal,
                { provide: MessageBoxService, useClass: MessageBoxService },
                { provide: ElementRef , useValue: new MockElementRef()} ,
            ],
            imports: [
                FormsModule,
                HttpClientModule,
                NgbModule,
                MaterialModule,
                NoopAnimationsModule,
                ToastNoAnimationModule.forRoot(),
                ToastrModule.forRoot(),
                ModalDialogComponent,
                ModalContentDialogComponent,
            ],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(MatchDetailComponent);
                component = fixture.componentInstance;
                fastMarketService = TestBed.inject(RequestService);
                messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
                toastrService = fixture.debugElement.injector.get(ToastrService);
            });
    }));

    it('should create the app', waitForAsync(() => {
        expect(component).toBeTruthy();
    }));

    it('ngOnInit - should get match detail', fakeAsync(() => {
        jest.spyOn(UrlHelper, 'getUrlParameter').mockReturnValue('700000');
        jest.spyOn(fastMarketService, 'getMatchDetail').mockReturnValue(of(matchDetail));

        component.ngOnInit();
        matchDetail.autoSettingIcon.match = '';
        component.ngOnInit();

        expect(component.matchDetail).toEqual(matchDetail);
    }));

    describe('confirmUpdateMatchAutoSettle', () => {
        it('should do nothing when autoSettingIcon is disabled', () => {
            matchDetail.autoSettingIcon.disabled = true;
            component.matchDetail = matchDetail;

            component.confirmUpdateMatchAutoSettle();

            expect(component.matchDetail).toEqual(matchDetail);
        });

        it('should successfully update setting', fakeAsync(() => {
            matchDetail.autoSettingIcon.disabled = false;
            component.matchDetail = matchDetail;
            jest.spyOn(fastMarketService, 'updateMatchAutoSettle').mockReturnValue(of(successfulResult));
            jest.spyOn(fastMarketService, 'getMatchDetail').mockReturnValue(of(matchDetail));
            let confirmCallback: Function;
            jest.spyOn(messageBoxService, 'confirm').mockImplementation((message, callback) => {
                confirmCallback = callback;
            });

            component.confirmUpdateMatchAutoSettle();
            confirmCallback();
            tick();

            expect(component.matchDetail).toEqual(matchDetail);
        }));

        it('should alert when failing to update setting', fakeAsync(() => {
            matchDetail.autoSettingIcon.disabled = false;

            component.matchDetail = matchDetail;
            jest.spyOn(fastMarketService, 'updateMatchAutoSettle').mockReturnValue(of(unSuccessfulResult));
            jest.spyOn(toastrService, 'error');
            let confirmCallback: Function;
            jest.spyOn(messageBoxService, 'confirm').mockImplementation((message, callback) => {
                confirmCallback = callback;
            });

            component.confirmUpdateMatchAutoSettle();
            confirmCallback();
            tick();
            flush();

            expect(toastrService.error).toHaveBeenCalled();
        }));
    });

    describe('confirmUpdateLeagueAutoSettle', () => {
        it('should do nothing when autoSettingIcon is disabled', () => {
            matchDetail.autoSettingIcon.disabled = true;
            component.matchDetail = matchDetail;

            component.confirmUpdateLeagueAutoSettle();

            expect(component.matchDetail).toEqual(matchDetail);
        });

        it('should successfully update setting', fakeAsync(() => {
            matchDetail.autoSettingIcon.disabled = false;
            component.matchDetail = matchDetail;
            jest.spyOn(fastMarketService, 'updateLeagueAutoSettle').mockReturnValue(of(successfulResult));
            jest.spyOn(fastMarketService, 'getMatchDetail').mockReturnValue(of(matchDetail));
            let confirmCallback: Function;
            jest.spyOn(messageBoxService, 'confirm').mockImplementation((message, callback) => {
                confirmCallback = callback;
            });

            component.confirmUpdateLeagueAutoSettle();
            confirmCallback();
            tick();

            expect(component.matchDetail).toEqual(matchDetail);
        }));

        it('should successfully update league setting only', fakeAsync(() => {
            matchDetail.autoSettingIcon.disabled = false;
            component.matchDetail = matchDetail;
            jest.spyOn(fastMarketService, 'updateLeagueAutoSettle').mockReturnValue(of(successfulResult));
            jest.spyOn(fastMarketService, 'getMatchDetail').mockReturnValue(of(matchDetail));
            let confirmCallback: Function;
            let noCallback: Function;
            jest.spyOn(messageBoxService, 'confirm').mockImplementation((message, callback, noBtnCallback) => {
                confirmCallback = callback;
                noCallback = noBtnCallback;
            });

            component.confirmUpdateLeagueAutoSettle();
            noCallback();
            tick();

            expect(component.matchDetail).toEqual(matchDetail);
        }));

        it('should alert when failing to update setting', fakeAsync(() => {
            matchDetail.autoSettingIcon.disabled = false;

            component.matchDetail = matchDetail;
            jest.spyOn(fastMarketService, 'updateLeagueAutoSettle').mockReturnValue(of(unSuccessfulResult));
            jest.spyOn(toastrService, 'error');
            let confirmCallback: Function;
            jest.spyOn(messageBoxService, 'confirm').mockImplementation((message, callback) => {
                confirmCallback = callback;
            });

            component.confirmUpdateLeagueAutoSettle();
            confirmCallback();
            tick();
            flush();

            expect(toastrService.error).toHaveBeenCalled();
        }));
    });
});
