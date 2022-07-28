import { TestBed, waitForAsync, ComponentFixture, inject, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ElementRef } from "@angular/core";
import { ModalDialogComponent, ModalContentDialogComponent } from '../../shared/components';
import { MatchDetailComponent } from './match-detail.component';
import { MatchDetail, AutoSettingIcon } from '../models';
import { FastMarketBetType } from '../constants';
import { MessageBoxService, HttpRequestService, BlockUIService } from '../../shared/services';
import { RequestService } from '../services/request.service';
import { UrlHelper } from '../../helper';

describe('Component: MatchDetailComponent', () => {
    let component: MatchDetailComponent;
    let fixture: ComponentFixture<MatchDetailComponent>;
    let fastMarketService: RequestService;
    let messageBoxService: MessageBoxService;
    const buttonName = "btn-danger";
    const errorMessage = "Error message";
    const matchDetail = new MatchDetail ();
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
                ModalDialogComponent,
                ModalContentDialogComponent,
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
            ],
        })
            .overrideModule(BrowserDynamicTestingModule, {
                set: {
                    entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
                },
            })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(MatchDetailComponent);
                component = fixture.componentInstance;
                fastMarketService = fixture.debugElement.injector.get(RequestService);
                messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
            });
    }));

    it('should create the app', waitForAsync(() => {
        expect(component).toBeTruthy();
    }));

    it('ngOnInit - should get match detail', fakeAsync(() => {
        spyOn(UrlHelper, 'getUrlParameter').and.returnValue('700000');
        spyOn(fastMarketService, 'getMatchDetail').and.returnValue(of(matchDetail));

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
            spyOn(fastMarketService, 'updateMatchAutoSettle').and.returnValue(of(successfulResult));
            spyOn(fastMarketService, 'getMatchDetail').and.returnValue(of(matchDetail));
            spyOn(component, 'changeColorOnManualCalculatePage');

            component.confirmUpdateMatchAutoSettle();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(component.matchDetail).toEqual(matchDetail);
        }));

        it('should alert when failing to update setting', fakeAsync(() => {
            matchDetail.autoSettingIcon.disabled = false;

            component.matchDetail = matchDetail;
            spyOn(fastMarketService, 'updateMatchAutoSettle').and.returnValue(of(unSuccessfulResult));
            spyOn(messageBoxService, 'alert');

            component.confirmUpdateMatchAutoSettle();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(messageBoxService.alert).toHaveBeenCalled();
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
            spyOn(fastMarketService, 'updateLeagueAutoSettle').and.returnValue(of(successfulResult));
            spyOn(fastMarketService, 'getMatchDetail').and.returnValue(of(matchDetail));
            spyOn(component, 'changeColorOnManualCalculatePage');

            component.confirmUpdateLeagueAutoSettle();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(component.matchDetail).toEqual(matchDetail);
        }));

        it('should successfully update league setting only', fakeAsync(() => {
            matchDetail.autoSettingIcon.disabled = false;
            component.matchDetail = matchDetail;
            spyOn(fastMarketService, 'updateLeagueAutoSettle').and.returnValue(of(successfulResult));
            spyOn(fastMarketService, 'getMatchDetail').and.returnValue(of(matchDetail));
            spyOn(component, 'changeColorOnManualCalculatePage');

            component.confirmUpdateLeagueAutoSettle();
            const buttonNo = document.getElementsByClassName('btn-default')[0] as HTMLElement;
            buttonNo.click();
            tick();

            expect(component.matchDetail).toEqual(matchDetail);
        }));

        it('should alert when failing to update setting', fakeAsync(() => {
            matchDetail.autoSettingIcon.disabled = false;

            component.matchDetail = matchDetail;
            spyOn(fastMarketService, 'updateLeagueAutoSettle').and.returnValue(of(unSuccessfulResult));
            spyOn(messageBoxService, 'alert');

            component.confirmUpdateLeagueAutoSettle();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(messageBoxService.alert).toHaveBeenCalled();
        }));
    });

    it('changeColorOnManualCalculatePage - should change color on parent page', () => {
        component.matchDetail = matchDetail;
        spyOn(component, 'changeColorOnParentPage');

        component.changeColorOnManualCalculatePage(true);

        expect(component.changeColorOnParentPage).toHaveBeenCalled();
    });
});
