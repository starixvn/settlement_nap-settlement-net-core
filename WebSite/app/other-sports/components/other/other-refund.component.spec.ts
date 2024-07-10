import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ResourceHeaderPipe, ScorePipe } from '../../pipes';
import { ModalContentDialogComponent, ModalDialogComponent} from '../../../shared/components';
import { HttpClientModule } from '@angular/common/http';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../services/request.service';
import { BlockUIService, ClosePopupService, HttpRequestService, MessageBoxService } from '../../../shared/services';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ToastContainerDirective, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { Match, MatchDetail, OtherSportsMatch, Permission, QueryMatch } from '../../models';
import { HedgeMatchDetail } from '../../../shared/models/sportsbook-sop/hedge-match-detail.model';
import { of } from 'rxjs';
import { Language } from '../../../shared/language.native';
import { OtherRefundComponent } from './other-refund.component';
import { OtherService } from './other.service';
import { Result } from '../../../shared/models';

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
    };
    const unSuccessfulResult: Result = {
        errCode: 1,
        errMsg: errorMessage,
        isSuccessful: false,
        childMatchIds: "",
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                OtherRefundComponent,
                ModalDialogComponent,
                ModalContentDialogComponent,
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
        spyOn(requestService, 'getMatch').and.returnValue(of(otherSportsMatch));
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

        it('should show error when refund failed', fakeAsync(() => {
            const notExistMarkedTicket = {
                isExistMarkedTicket: false,
            };
            matchDetail.matchId = 1234
            component.matchDetail = matchDetail;
            component.hedgeMatchDetail = new HedgeMatchDetail();
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

        it('should close popup when refund success', fakeAsync(() => {
            const notExistMarkedTicket = {
                isExistMarkedTicket: false,
            };
            matchDetail.matchId = 1234
            component.matchDetail = matchDetail;
            component.hedgeMatchDetail = new HedgeMatchDetail();
            spyOn(closePopupService, 'closePopup');
            spyOn(requestService, 'checkMarkedTickets').and.returnValue(of(notExistMarkedTicket));
            spyOn(requestService, 'refund').and.returnValue(of(successfulResult));

            component.refund("Refund", false);
            const params = {
                matchId: 1234,
                action: "Refund",
            };
            tick();

            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(requestService.checkMarkedTickets).toHaveBeenCalledWith(params)
        }));
    });
});