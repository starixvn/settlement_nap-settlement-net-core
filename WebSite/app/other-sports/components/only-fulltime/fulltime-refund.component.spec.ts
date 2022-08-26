import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { BlockUIService, ClosePopupService, HttpRequestService, MessageBoxService} from '../../../shared/services';
import { FullTimeRefundComponent } from './fulltime-refund.component';
import { HttpClientModule } from '@angular/common/http';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ModalContentDialogComponent, ModalDialogComponent } from '../../../shared/components';
import { Match, MatchDetail, OtherSportsMatch, Permission, QueryMatch } from '../../models';
import { TicketCount } from '../../../shared/models';
import { of } from 'rxjs';
import { Language } from '../../../shared/language';
import { CalculateAction } from '../../../shared/constants';
import { RequestService } from '../../services/request.service';
import { FullTimeService } from './fulltime.service';
import { ToastContainerDirective, ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';

describe('RefundActionsComponent', () => {
  let component: FullTimeRefundComponent;
  let fixture: ComponentFixture<FullTimeRefundComponent>;
  let messageBoxService: MessageBoxService;
  let requestService: RequestService;
  let closePopupService: ClosePopupService;
  let toastrService: ToastrService;

  const ticketCount: TicketCount = {
    groupId: 0,
    groupName: null,
    betRunningCount: 0,
    betMarkedCount: 0,
    betSettledCount: 0,
  };

  const matchDetail = {} as MatchDetail;
  matchDetail.sportType = 60;
  matchDetail.matchId = 123;
  matchDetail.sportName = 'test';
  matchDetail.matchCode = 'abc';
  matchDetail.playTime = 60;
  matchDetail.confirmHT = 0;
  matchDetail.confirmFT = 0;
  matchDetail.externalSourceName = 'SBO';

  const permission: Permission = {
    canCalculate: true,
    canRefund: true,
    canUncalculate: true,
    isLeader: true,
  }

  const match: Match = {
    ticketCount: [ticketCount],
    matchDetail,
    hedgeMatchDetail: null,
    resultDetails: [],
  }

  const otherSportsMatch: OtherSportsMatch = {
    match,
    permission,
  }

  const noMarkedTicket = {
    isExistMarkedTicket: false,
  };

  const existMarkedTicket = {
    isExistMarkedTicket: true,
  };

  const successfulResult = {
    errCode: 0,
    errMsg: "",
    isSuccessful: true,
  };

  const buttonName = "btn-danger";

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        FullTimeRefundComponent,
        ModalDialogComponent,
        ModalContentDialogComponent],
      imports: [
        HttpClientModule,
        NgbModule,
        ToastNoAnimationModule.forRoot(),
        ToastContainerModule,
        ToastrModule.forRoot()
      ],
      providers: [
        RequestService,
        ClosePopupService,
        BlockUIService,
        HttpRequestService,
        FullTimeService,
        NgbModal,
        ToastContainerDirective,
        { provide: ToastrService, useClass: ToastrService },
        { provide: MessageBoxService, useClass: MessageBoxService },
      ]
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
      },
    })
      .compileComponents()
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FullTimeRefundComponent);
    component = fixture.componentInstance;
    messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
    requestService = fixture.debugElement.injector.get(RequestService);
    closePopupService = fixture.debugElement.injector.get(ClosePopupService);
    toastrService = fixture.debugElement.injector.get(ToastrService);
    component.matchDetail = matchDetail;
    fixture.detectChanges();
    spyOn(closePopupService, 'closePopup').and.callFake(() => { });
    spyOn(requestService, 'getMatch').and.returnValue(of(otherSportsMatch));
    spyOn(toastrService, 'error');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getMatch', () => {
    it('getMatch - should call getMatch function with correct param', () => {
      const matchId = 123;
      const query = new QueryMatch(matchId, true);

      component.getMatch(matchId, '');

      expect(requestService.getMatch).toHaveBeenCalledWith(query);
    });

    it('should disable score direct', async () => {
      const matchId = 123;
      match.matchDetail.finalHomeScore = null;
      match.matchDetail.finalAwayScore = null;

      await component.getMatch(matchId, '');
      expect(component.matchDetail.finalAwayScore).toEqual(null);
      expect(component.matchDetail.finalHomeScore).toEqual(null);
    });
  });

  describe('Refund', () => {
    beforeEach(() =>{
      component.match = match;
      component.matchDetail = matchDetail;
    });
    it('should clear errorMessage', fakeAsync(() => {
      // Arrange
      spyOn(toastrService, 'clear');
      spyOn(requestService, 'checkMarkedTickets').and.returnValue(of(noMarkedTicket));

      // Act
      component.refund();
      tick();

      // Assert
      expect(toastrService.clear).toHaveBeenCalled();
    }));

    it('should alert when exist marked tickets', fakeAsync(() => {
      // Arrange
      component.match = match;
      spyOn(requestService, 'checkMarkedTickets').and.returnValue(of(existMarkedTicket));

      // Act
      component.refund();
      tick();

      // Assert
      expect(toastrService.error).toHaveBeenCalledWith(Language.MarkedTicket);
    }));

    it('should invoke messageBoxService.confirm when no marked tickets exist',
      fakeAsync(() => {
        // Arrange
        component.match = match;
        spyOn(requestService, 'checkMarkedTickets').and.returnValue(of(noMarkedTicket));
        spyOn(messageBoxService, 'confirm');

        // Act
        component.refund();
        tick();

        // Assert
        expect(component.confirmationDialogMessage.message).toEqual("Are you sure you want to REFUND/CANCEL? This function is only in use when the match cancel?");
        expect(messageBoxService.confirm).toHaveBeenCalled();
      }));

    it('should be successful, error message is empty', () => {
      // Arrange
      component.match = match;
      spyOn(requestService, 'checkMarkedTickets').and.returnValue(of(noMarkedTicket));
      spyOn(requestService, 'refund').and.returnValue(of(successfulResult));

      // Act
      component.refund();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();

      // Assert
      expect(toastrService.error).not.toHaveBeenCalled();
    });
  });

  describe('RefundParlay', () => {
    beforeEach(() =>{
      component.match = match;
      component.matchDetail = matchDetail;
    });
    it('should clear errorMessage and call checkMarkedTickets', fakeAsync(() => {
      // Arrange
      spyOn(toastrService, 'clear');
      component.matchDetail.matchId = 123;
      const query = {
        matchId: 123,
        action: CalculateAction.refund,
      }
      spyOn(requestService, 'checkMarkedTickets').and.returnValue(of(noMarkedTicket));

      // Act
      component.refund();
      tick();

      // Assert
      expect(requestService.checkMarkedTickets).toHaveBeenCalledWith(query);
      expect(toastrService.clear).toHaveBeenCalled();
    }));

    it('should alert when exist marked tickets', fakeAsync(() => {
      // Arrange
      component.match = match;
      spyOn(requestService, 'checkMarkedTickets').and.returnValue(of(existMarkedTicket));
      spyOn(messageBoxService, 'alert');

      // Act
      component.refundParlay();
      tick();

      // Assert
      expect(toastrService.error).toHaveBeenCalledWith(Language.MarkedTicket);
    }));

    it('should invoke messageBoxService.confirm when no marked tickets exist',
      fakeAsync(() => {
        // Arrange
        component.match = match;
        spyOn(requestService, 'checkMarkedTickets').and.returnValue(of(noMarkedTicket));
        spyOn(messageBoxService, 'confirm');

        // Act
        component.refundParlay();
        tick();

        // Assert
        expect(component.confirmationDialogMessage.message).toEqual("Are you sure you want to REFUND PARLAY this match?");
        expect(messageBoxService.confirm).toHaveBeenCalled();
      }));

    it('should be successful, error message is empty', () => {
      // Arrange
      component.match = match;
      spyOn(requestService, 'checkMarkedTickets').and.returnValue(of(noMarkedTicket));
      spyOn(requestService, 'refundParlay').and.returnValue(of(successfulResult));

      // Act
      component.refundParlay();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();

      // Assert
      expect(toastrService.error).not.toHaveBeenCalled();
    });
  });
});
