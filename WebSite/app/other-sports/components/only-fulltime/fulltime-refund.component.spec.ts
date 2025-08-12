import { ComponentFixture, fakeAsync, TestBed, tick, flush } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BlockUIService, ClosePopupService, HttpRequestService, MessageBoxService} from '../../../shared/services';
import { FullTimeRefundComponent } from './fulltime-refund.component';
import { HttpClientModule } from '@angular/common/http';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalContentDialogComponent } from '../../../shared/components/modal-dialog/modal-content-dialog.component';
import { ModalDialogComponent } from '../../../shared/components/modal-dialog/modal-dialog.component';
import { Match, MatchDetail, OtherSportsMatch, Permission, QueryMatch } from '../../models';
import { TicketCount } from '../../../shared/models';
import { Language } from '../../../shared/language.native';
import { RequestService } from '../../services/request.service';
import { FullTimeService } from './fulltime.service';
import { ToastContainerDirective, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';

describe('RefundActionsComponent', () => {
  let component: FullTimeRefundComponent;
  let fixture: ComponentFixture<FullTimeRefundComponent>;
  let messageBoxService: MessageBoxService;
  let requestService: RequestService;
  let closePopupService: ClosePopupService;
  let toastrService: ToastrService;
  let fullTimeService: FullTimeService;

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
        FullTimeRefundComponent],
      imports: [
        HttpClientModule,
        NgbModule,
        ToastNoAnimationModule.forRoot(),
        ToastrModule.forRoot(),
        ModalDialogComponent,
        ModalContentDialogComponent,
        NoopAnimationsModule
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
    fullTimeService = fixture.debugElement.injector.get(FullTimeService);
    component.matchDetail = matchDetail;
    fixture.detectChanges();
    jest.spyOn(closePopupService, 'closePopup').mockImplementation(() => { });
    jest.spyOn(requestService, 'getMatch').mockResolvedValue(otherSportsMatch);
    jest.spyOn(toastrService, 'error');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getMatch',  () => {
    it('getMatch - should call getMatch function with correct param', fakeAsync( () => {
      const matchId = 123;
      const query = new QueryMatch(matchId, true);

      component.getMatch(matchId);

      expect(requestService.getMatch).toHaveBeenCalledWith(query);
    }));

    it('should disable score direct', async () => {
      const matchId = 123;
      match.matchDetail.finalHomeScore = null;
      match.matchDetail.finalAwayScore = null;

      await component.getMatch(matchId);
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
      jest.spyOn(toastrService, 'clear');
      jest.spyOn(requestService, 'checkMarkedTickets').mockResolvedValue(noMarkedTicket);

      // Act
      component.refund();
      tick();

      // Assert
      expect(toastrService.clear).toHaveBeenCalled();
    }));

    it('should alert when exist marked tickets', fakeAsync(() => {
      // Arrange
      component.match = match;
      jest.spyOn(requestService, 'checkMarkedTickets').mockResolvedValue(existMarkedTicket);

      // Act
      component.refund();
      tick();
      flush();

      // Assert
      expect(toastrService.error).toHaveBeenCalledWith(Language.MarkedTicket);
    }));

    it('should invoke messageBoxService.confirm when no marked tickets exist',
      fakeAsync(() => {
        // Arrange
        component.match = match;
              jest.spyOn(requestService, 'checkMarkedTickets').mockResolvedValue(noMarkedTicket);
      jest.spyOn(messageBoxService, 'confirm');

        // Act
        component.refund();
        tick();

        // Assert
        expect(component.confirmationDialogMessage.message).toEqual("Are you sure you want to REFUND/CANCEL? This function is only in use when the match cancel?");
        expect(messageBoxService.confirm).toHaveBeenCalled();
      }));

    it('should be successful, error message is empty', fakeAsync(() => {
      // Arrange
      component.match = match;
      jest.spyOn(requestService, 'checkMarkedTickets').mockResolvedValue(noMarkedTicket);
      jest.spyOn(fullTimeService, 'refund').mockResolvedValue('');

      // Act
      component.refund();
      tick();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      if (buttonYes) {
        buttonYes.click();
        tick();
        flush();
      }

      // Assert
      expect(toastrService.error).not.toHaveBeenCalled();
    }));
  });


});
