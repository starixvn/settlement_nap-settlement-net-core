import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ResourceHeaderPipe, ScorePipe } from '../../pipes';
import { ModalContentDialogComponent } from '../../../shared/components/modal-dialog/modal-content-dialog.component';
import { ModalDialogComponent } from '../../../shared/components/modal-dialog/modal-dialog.component';
import { NotReadyMatchComponent } from '../../../shared/components/not-ready-match/not-ready-match.component';
import { ResettleCheckerComponent } from '../../../shared/components/resettle-checker/resettle-checker.component';
import { TicketCountComponent } from '../../../shared/components/ticket-count/ticket-count.component';
import { HttpClientModule } from '@angular/common/http';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../services/request.service';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../../shared/services';
import { HalfTimeFullTimeService } from './halftime-fulltime.service';
import { VerificationService } from './verification.service';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ToastContainerDirective, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { Match, MatchDetail, OtherSportsMatch, Permission, QueryMatch } from '../../models';
import { ResultDetail } from '../../../shared/models/sportsbook-sop/result-detail.model';
import { ResourcesIds } from '../../constants';
import { HedgeMatchDetail } from '../../../shared/models/sportsbook-sop/hedge-match-detail.model';
import { of } from 'rxjs';
import { Language } from '../../../shared/language.native';
import { HalfTimeFullTimeRefundComponent } from './halftime-fulltime-refund.component';

describe('HalfTimeFullTimeRefundComponent', () => {
    let component: HalfTimeFullTimeRefundComponent;
    let fixture: ComponentFixture<HalfTimeFullTimeRefundComponent>;
    let requestService: RequestService;
    let halfTimeFullTimeService: HalfTimeFullTimeService;
    let toastrService: ToastrService;
    let messageBoxService: MessageBoxService;

    const matchDetail = new MatchDetail();
    const halfTime = new ResultDetail();
    halfTime.resourceId = ResourcesIds.halfTime;
    const fullTime = new ResultDetail();
    fullTime.resourceId = ResourcesIds.fullTime;
    const match: Match = {
        matchDetail,
        resultDetails: [halfTime, fullTime],
        ticketCount: [],
        hedgeMatchDetail: new HedgeMatchDetail()
    }
    const permission = new Permission();
    const otherSportsMatch: OtherSportsMatch = {
        match,
        permission
    }
    const buttonName = "btn-danger";
    const errorMessage = "Error message";
    const successfulResult = {
        errCode: 0,
        errMsg: null,
        isSuccessful: true,
    };
    const unSuccessfulResult = {
        errCode: 1,
        errMsg: errorMessage,
        isSuccessful: false,
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                HalfTimeFullTimeRefundComponent,
                ModalDialogComponent,
                ModalContentDialogComponent,
                TicketCountComponent,
                ResettleCheckerComponent,
                NotReadyMatchComponent,
                ScorePipe,
                ResourceHeaderPipe
            ],
            imports: [
                HttpClientModule,
                NgbModule,
                FormsModule,
                ToastNoAnimationModule.forRoot(),
                ToastrModule.forRoot()
            ],
            providers: [
                RequestService,
                MessageBoxService,
                BlockUIService,
                HttpRequestService,
                HalfTimeFullTimeService,
                VerificationService,
                NgbModal,
                ToastContainerDirective,
                { provide: ToastrService, useClass: ToastrService },
                { provide: MessageBoxService, useClass: MessageBoxService },
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HalfTimeFullTimeRefundComponent);
        requestService = fixture.debugElement.injector.get(RequestService);
        halfTimeFullTimeService = fixture.debugElement.injector.get(HalfTimeFullTimeService);
        toastrService = fixture.debugElement.injector.get(ToastrService);
        messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('getMatch - Always call function get match and all function related', fakeAsync(() => {
        spyOn(requestService, 'getMatch').and.returnValue(of(otherSportsMatch));
        spyOn(halfTimeFullTimeService, 'processScore');
        spyOn(halfTimeFullTimeService, 'numberSetOnHalfTime');
        component.resultDetails = [halfTime, fullTime];
        const query = new QueryMatch(1, true);

        component.getMatch(1);
        tick();

        expect(requestService.getMatch).toHaveBeenCalledWith(query);
        expect(halfTimeFullTimeService.processScore).toHaveBeenCalled();
        expect(halfTimeFullTimeService.numberSetOnHalfTime).toHaveBeenCalled();
        expect(component.hasHalfTime).toBeTruthy();
    }));

    it('halfTime - should return half time result', () => {
        component.resultDetails = [halfTime, fullTime];
        const result = component.halfTime;
        expect(result).toEqual(halfTime);
    });

    it('fullTime - should return full time result', () => {
        component.resultDetails = [halfTime, fullTime];
        const result = component.fullTime;
        expect(result).toEqual(fullTime);
    });

    it('results - should return set result', () => {
        const resultDetail = new ResultDetail();
        resultDetail.resourceId = "1Q";
        component.resultDetails = [resultDetail, halfTime, fullTime];

        const result = component.results;
        expect(result[0].resourceId).toEqual("1Q");
    });

    describe('refund', () => {
        it('should show error when match has marked ticket', fakeAsync(() => {
            const existMarkedTicket = {
                isExistMarkedTicket: true,
            };
            matchDetail.matchId = 1234
            component.matchDetail = matchDetail;
            spyOn(toastrService, 'clear');
            spyOn(toastrService, 'error');
            spyOn(requestService, 'checkMarkedTickets').and.returnValue(of(existMarkedTicket));

            component.refund("Refund", true);
            const params = {
                matchId: 1234,
                action: "MP-Refund",
            };
            tick();

            expect(toastrService.clear).toHaveBeenCalled();
            expect(toastrService.error).toHaveBeenCalledWith(Language.MarkedTicket);
            expect(requestService.checkMarkedTickets).toHaveBeenCalledWith(params)
        }));

        it('should show error when refund normal failed', fakeAsync(() => {
            const notExistMarkedTicket = {
                isExistMarkedTicket: false,
            };
            matchDetail.matchId = 1234
            component.matchDetail = matchDetail;
            spyOn(toastrService, 'error');
            spyOn(requestService, 'checkMarkedTickets').and.returnValue(of(notExistMarkedTicket));
            spyOn(requestService, 'refund').and.returnValue(of(unSuccessfulResult));

            component.refund("Refund", false);
            const params = {
                matchId: 1234,
                action: "Refund",
            };
            tick();

            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(toastrService.error).toHaveBeenCalledWith(unSuccessfulResult.errMsg);
            expect(requestService.checkMarkedTickets).toHaveBeenCalledWith(params)
        }));

        it('should show error when refund parlay failed', fakeAsync(() => {
            const notExistMarkedTicket = {
                isExistMarkedTicket: false,
            };
            matchDetail.matchId = 1234
            component.matchDetail = matchDetail;
            spyOn(toastrService, 'error');
            spyOn(requestService, 'checkMarkedTickets').and.returnValue(of(notExistMarkedTicket));
            spyOn(requestService, 'refundParlay').and.returnValue(of(unSuccessfulResult));

            component.refund("Refund", true);
            const params = {
                matchId: 1234,
                action: "MP-Refund",
            };
            tick();

            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(toastrService.error).toHaveBeenCalledWith(unSuccessfulResult.errMsg);
            expect(requestService.checkMarkedTickets).toHaveBeenCalledWith(params)
        }));

        it('should close popup when refund success', fakeAsync(() => {
            const notExistMarkedTicket = {
                isExistMarkedTicket: false,
            };
            matchDetail.matchId = 1234
            component.matchDetail = matchDetail;
            spyOn(messageBoxService, 'closePopup');
            spyOn(requestService, 'checkMarkedTickets').and.returnValue(of(notExistMarkedTicket));
            spyOn(requestService, 'refundParlay').and.returnValue(of(successfulResult));

            component.refund("Refund", true);
            const params = {
                matchId: 1234,
                action: "MP-Refund",
            };
            tick();

            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(messageBoxService.closePopup).toHaveBeenCalled();
            expect(requestService.checkMarkedTickets).toHaveBeenCalledWith(params)
        }));
    });
});