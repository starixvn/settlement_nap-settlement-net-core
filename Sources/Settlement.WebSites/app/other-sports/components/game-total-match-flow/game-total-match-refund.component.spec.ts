import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastContainerDirective, ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { ScoreMatchByPermissionPipe } from '../../pipes';
import { ResourceHeaderPipe } from '../../pipes/resource-header.pipe';
import { RequestService } from '../../services/request.service';
import { ModalContentDialogComponent, ModalDialogComponent } from '../../../shared/components';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../../shared/services';

import { GameTotalMatchRefundComponent } from './game-total-match-refund.component';
import { GameTotalMatchVerificationService } from './game-total-match-verification.service';
import { GameTotalMatchService } from './game-total-match.service';
import { Match, MatchDetail, OtherSportsMatch } from '../../models';
import { of } from 'rxjs';
import { MarkedTicketsModel } from '../../../shared/models';
import { HedgeMatchDetail, ResultDetail } from '../../../shared/models/sportsbook-sop';

describe('GameTotalMatchRefundComponent', () => {
  let component: GameTotalMatchRefundComponent;
  let fixture: ComponentFixture<GameTotalMatchRefundComponent>;
  let requestService: RequestService;
  let gameTotalMatchService: GameTotalMatchService;
  let verificationService: GameTotalMatchVerificationService;
  let toastrService: ToastrService;
  const markedTicket: MarkedTicketsModel = {
    isExistMarkedTicket: true
  };
  const noMarkedTicket: MarkedTicketsModel = {
    isExistMarkedTicket: false
  };
  const buttonName = "btn-danger";
  const errorMessage = "error";
  const successfulResult = {
    errCode: 0,
    errMsg: null,
    isSuccessful: true,
  };

const unsuccessfulResult = {
    errCode: 1,
    errMsg: errorMessage,
    isSuccessful: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameTotalMatchRefundComponent,
        ModalDialogComponent,
        ModalContentDialogComponent,
        ResourceHeaderPipe,
        ScoreMatchByPermissionPipe,
       ],
        imports: [
          HttpClientModule,
          NgbModule,
          FormsModule,
          ToastNoAnimationModule.forRoot(),
          ToastContainerModule,
          ToastrModule.forRoot()
        ],
        providers: [
          ClosePopupService,
          GameTotalMatchService,
          GameTotalMatchVerificationService,
          BlockUIService,
          HttpRequestService,
          RequestService,
          NgbModal,
          ToastContainerDirective,
          { provide: ToastrService, useClass: ToastrService },
          { provide: MessageBoxService, useClass: MessageBoxService },
        ],
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
          entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
      },
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameTotalMatchRefundComponent);
    component = fixture.componentInstance;
    verificationService = fixture.debugElement.injector.get(GameTotalMatchVerificationService);
    gameTotalMatchService = fixture.debugElement.injector.get(GameTotalMatchService);
    requestService = fixture.debugElement.injector.get(RequestService);
    closePopupService = fixture.debugElement.injector.get(ClosePopupService);
    toastrService = fixture.debugElement.injector.get(ToastrService);
    spyOn(toastrService, 'clear');
    spyOn(toastrService, 'error');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getMatch - should get match and init properties',async () => {
    const otherSportMatch = {
      match: {
        matchDetail: {
          matchId: 12345
        } as MatchDetail,
        resultDetails: []
      } as Match
    } as OtherSportsMatch;
    spyOn(requestService, 'getMatch').and.returnValue(of(otherSportMatch));
    spyOn(gameTotalMatchService, 'getResultDetail').and.returnValue([]);

    await component.getMatch(12345, 'local');

    expect(component.matchDetail.matchId).toEqual(12345);
  });

  describe('refund', () => {
    it('no error has been raised when refund successfully', fakeAsync(() => {
      component.resultDetails = [{
        resourceId: '00',
        homeValue: '2',
        awayValue: '1'
      } as ResultDetail];
      component.matchDetail = new MatchDetail();
      spyOn(requestService, 'checkMarkedTickets').and.returnValue(of(noMarkedTicket));
      spyOn(requestService, 'refund').and.returnValue(of(successfulResult));
      spyOn(closePopupService, 'closePopup');

      component.refund();
      tick();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).not.toHaveBeenCalled();
    }));

    it('should raise error when exist marked ticket', async () => {
      component.matchDetail = new MatchDetail();
      spyOn(requestService, 'checkMarkedTickets').and.returnValue(of(markedTicket));

      await component.refund();

      expect(toastrService.error).toHaveBeenCalledWith("ERROR! Cannot proceed due to marked tickets. Please unmark them and try again.");
    });

    it('should raise error when refund unsuccessfully', fakeAsync( async () => {
      component.resultDetails = [{
        resourceId: '00',
        homeValue: '2',
        awayValue: '1'
      } as ResultDetail];
      component.matchDetail = new MatchDetail();
      component.hedgeMatchDetail = {
        matchId: 123
      } as HedgeMatchDetail;
      component.applyHedgeMatch = true;
      spyOn(requestService, 'checkMarkedTickets').and.returnValue(of(noMarkedTicket));
      spyOn(requestService, 'refund').and.returnValue(of(unsuccessfulResult));

      await component.refund();
      tick();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith('error');
    }));
  });

  describe('refundParlay', () => {
    it('no error has been raised when refund successfully', fakeAsync( async () => {
      component.matchDetail = new MatchDetail();
      spyOn(requestService, 'checkMarkedTickets').and.returnValue(of(noMarkedTicket));
      spyOn(requestService, 'refundParlay').and.returnValue(of(successfulResult));
      spyOn(closePopupService, 'closePopup');

      await component.refundParlay();
      tick();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).not.toHaveBeenCalled();
    }));

    it('should raise error when exist marked ticket', async () => {
      component.matchDetail = new MatchDetail();
      spyOn(requestService, 'checkMarkedTickets').and.returnValue(of(markedTicket));

      await component.refundParlay();

      expect(toastrService.error).toHaveBeenCalledWith("ERROR! Cannot proceed due to marked tickets. Please unmark them and try again.");
    });

    it('should raise error when refund unsuccessfully', fakeAsync( async () => {
      component.matchDetail = new MatchDetail();
      component.hedgeMatchDetail = {
        matchId: 123
      } as HedgeMatchDetail;
      component.applyHedgeMatch = true;
      spyOn(requestService, 'checkMarkedTickets').and.returnValue(of(noMarkedTicket));
      spyOn(requestService, 'refundParlay').and.returnValue(of(unsuccessfulResult));

      await component.refundParlay();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith('error');
    }));
  });
});
