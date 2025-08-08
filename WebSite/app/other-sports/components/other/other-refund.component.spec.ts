import { ComponentFixture, fakeAsync, TestBed, tick, flush } from '@angular/core/testing';
import { ResourceHeaderPipe, ScorePipe } from '../../pipes';
import { ModalContentDialogComponent } from '../../../shared/components/modal-dialog/modal-content-dialog.component';
import { ModalDialogComponent } from '../../../shared/components/modal-dialog/modal-dialog.component';
import { HttpClientModule } from '@angular/common/http';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../services/request.service';
import { BlockUIService, ClosePopupService, HttpRequestService, MessageBoxService } from '../../../shared/services';
import { ToastContainerDirective, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { jest } from '@jest/globals';
import { Match, MatchDetail, OtherSportsMatch, Permission, QueryMatch } from '../../models';
import { HedgeMatchDetail } from '../../../shared/models/sportsbook-sop/hedge-match-detail.model';
import { of } from 'rxjs';
import { Language } from '../../../shared/language.native';
import { OtherRefundComponent } from './other-refund.component';
import { OtherService } from './other.service';
import { Result } from '../../../shared/models';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('OtherRefundComponent', () => {
    let component: OtherRefundComponent;
    let fixture: ComponentFixture<OtherRefundComponent>;
    let requestService: RequestService;
    let otherService: OtherService;
    let toastrService: ToastrService;
    let messageBoxService: MessageBoxService;
    let closePopupService: ClosePopupService;

    const matchDetail = new MatchDetail();
    const match: Match = {
        matchDetail,
        resultDetails: [],
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
        childMatchIds: "",
        settledSessionId: "",
        hasResultAmendment: false,
        isOrg: false
    };
    const unSuccessfulResult: Result = {
        errCode: 1,
        errMsg: errorMessage,
        isSuccessful: false,
        childMatchIds: "",
        settledSessionId: "",
        hasResultAmendment: false,
        isOrg: false
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                OtherRefundComponent,
                ScorePipe,
                ResourceHeaderPipe
            ],
            imports: [
                HttpClientModule,
                NgbModule,
                FormsModule,
                NoopAnimationsModule,
                ToastNoAnimationModule.forRoot(),
                ToastrModule.forRoot(),
                ModalDialogComponent,
                ModalContentDialogComponent
            ],
            providers: [
                RequestService,
                ClosePopupService,
                BlockUIService,
                HttpRequestService,
                OtherService,
                NgbModal,
                ToastContainerDirective,
                { provide: ToastrService, useClass: ToastrService },
                { provide: MessageBoxService, useClass: MessageBoxService },
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OtherRefundComponent);
        requestService = fixture.debugElement.injector.get(RequestService);
        otherService = fixture.debugElement.injector.get(OtherService);
        toastrService = fixture.debugElement.injector.get(ToastrService);
        messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
        closePopupService = fixture.debugElement.injector.get(ClosePopupService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('getMatch - call function get match', fakeAsync(() => {
        jest.spyOn(requestService, 'getMatch').mockReturnValue(Promise.resolve(otherSportsMatch));
        const query = new QueryMatch(1, true);

        component.getMatch(1);
        tick();

        expect(requestService.getMatch).toHaveBeenCalledWith(query);
    }));

    describe('refund', () => {
        it('should show error when match has marked ticket', fakeAsync(() => {
            const existMarkedTicket = {
                isExistMarkedTicket: true,
            };
            matchDetail.matchId = 1234
            component.matchDetail = matchDetail;
            jest.spyOn(toastrService, 'clear');
            jest.spyOn(toastrService, 'error');
            jest.spyOn(requestService, 'checkMarkedTickets').mockReturnValue(Promise.resolve(existMarkedTicket));

            component.refund("Refund");
            const params = {
                matchId: 1234,
                ResourceIds: "01,00"
            };
            tick();
            flush();

            expect(toastrService.clear).toHaveBeenCalled();
            expect(toastrService.error).toHaveBeenCalledWith(Language.MarkedTicket);
            expect(requestService.checkMarkedTickets).toHaveBeenCalledWith(params)
        }));

        it('should show error when refund failed', fakeAsync(() => {
            const notExistMarkedTicket = {
                isExistMarkedTicket: false,
            };
            matchDetail.matchId = 1234
            component.matchDetail = matchDetail;
            component.hedgeMatchDetail = new HedgeMatchDetail();
            jest.spyOn(toastrService, 'error');
            jest.spyOn(requestService, 'checkMarkedTickets').mockReturnValue(Promise.resolve(notExistMarkedTicket));
            jest.spyOn(requestService, 'sendRequest').mockReturnValue(Promise.resolve(unSuccessfulResult));

            component.refund("Refund");
            const params = {
                matchId: 1234,
                action: "Refund",
            };
            tick();

            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();
            flush();

            expect(toastrService.error).toHaveBeenCalledWith(unSuccessfulResult.errMsg);
            expect(requestService.checkMarkedTickets).toHaveBeenCalledWith({
                matchId: 1234,
                ResourceIds: "01,00"
            })
        }));

        it('should close popup when refund success', fakeAsync(() => {
            const notExistMarkedTicket = {
                isExistMarkedTicket: false,
            };
            matchDetail.matchId = 1234
            component.matchDetail = matchDetail;
            component.hedgeMatchDetail = new HedgeMatchDetail();
            jest.spyOn(closePopupService, 'closePopup');
            jest.spyOn(requestService, 'checkMarkedTickets').mockReturnValue(Promise.resolve(notExistMarkedTicket));
            jest.spyOn(requestService, 'sendRequest').mockReturnValue(Promise.resolve(successfulResult));

            component.refund("Refund");
            const params = {
                matchId: 1234,
                action: "Refund",
            };
            tick();

            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();
            flush();

            expect(requestService.checkMarkedTickets).toHaveBeenCalledWith({
                matchId: 1234,
                ResourceIds: "01,00"
            })
        }));
    });
});
