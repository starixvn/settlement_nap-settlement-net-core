import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick, flush } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastContainerDirective, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { ScoreMatchByPermissionPipe } from '../../pipes';
import { ResourceHeaderPipe } from '../../pipes/resource-header.pipe';
import { RequestService } from '../../services/request.service';
import { ModalContentDialogComponent } from '../../../shared/components/modal-dialog/modal-content-dialog.component';
import { ModalDialogComponent } from '../../../shared/components/modal-dialog/modal-dialog.component';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../../shared/services';
import { GameTotalMatchRefundComponent } from './game-total-match-refund.component';
import { GameTotalMatchVerificationService } from './game-total-match-verification.service';
import { GameTotalMatchService } from './game-total-match.service';
import { Match, MatchDetail, OtherSportsMatch } from '../../models';
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameTotalMatchRefundComponent,
        ResourceHeaderPipe,
        ScoreMatchByPermissionPipe,
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
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameTotalMatchRefundComponent);
    component = fixture.componentInstance;
    verificationService = fixture.debugElement.injector.get(GameTotalMatchVerificationService);
    gameTotalMatchService = fixture.debugElement.injector.get(GameTotalMatchService);
    requestService = fixture.debugElement.injector.get(RequestService);
    toastrService = fixture.debugElement.injector.get(ToastrService);
    jest.spyOn(toastrService, 'clear');
    jest.spyOn(toastrService, 'error');
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
    jest.spyOn(requestService, 'getMatch').mockResolvedValue(otherSportMatch);
    jest.spyOn(gameTotalMatchService, 'getResultDetail').mockReturnValue([]);

    await component.getMatch(12345);

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
      jest.spyOn(requestService, 'checkMarkedTickets').mockResolvedValue(noMarkedTicket);
      jest.spyOn(gameTotalMatchService, 'refund').mockResolvedValue('');

      component.refund();
      tick();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).not.toHaveBeenCalled();
    }));

    it('should raise error when exist marked ticket',fakeAsync( async () => {
        component.matchDetail = new MatchDetail();
        jest.spyOn(requestService, 'checkMarkedTickets').mockResolvedValue(markedTicket);
  
        await component.refund();
        tick();
        flush();
  
        expect(toastrService.error).toHaveBeenCalledWith("ERROR! Cannot proceed due to marked tickets. Please unmark them and try again.");
      }));

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
      jest.spyOn(requestService, 'checkMarkedTickets').mockResolvedValue(noMarkedTicket);
      jest.spyOn(gameTotalMatchService, 'refund').mockResolvedValue(errorMessage);

      await component.refund();
      tick();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();
      flush();

      expect(toastrService.error).toHaveBeenCalledWith('error');
    }));
  });
});
