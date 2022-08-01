import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { Language } from '../../../shared/language';
import { MaterialModule } from '../../../shared/material-module';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../../shared/services';
import { RefundType } from './model/constant.native';
import { MatchMoveBet } from './model/match.model';

import { MoveBetComponent } from './move-bet.component';
import { RequestService } from './services/request.service';

export class MatDialogRefMock {
  close(value: object) {

  }
}
describe('MoveBetComponent', () => {
  let component: MoveBetComponent;
  let fixture: ComponentFixture<MoveBetComponent>;
  let dialogRef: MatDialogRef<MoveBetComponent>;
  let toastrService: ToastrService;
  let requestService: RequestService;

  const matchMoveBet = {} as MatchMoveBet;
  const data = {
    matchId: 10000,
    refundType: RefundType.refundAll,
    apiUrl: ""
  }

  const result = {
    errCode: 0,
    errMsg: "",
    isSuccessful: true,
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MoveBetComponent],
      providers: [
        RequestService,
        HttpRequestService,
        BlockUIService,
        MessageBoxService,
        { provide: MessageBoxService, useClass: MessageBoxService },
        { provide: ToastrService, useClass: ToastrService },
        { provide: MatDialogRef, useValue: new MatDialogRefMock() },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
      imports: [
        HttpClientModule,
        MaterialModule,
        FormsModule,
        ToastNoAnimationModule.forRoot(),
        ToastContainerModule,
        ToastrModule.forRoot(),
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveBetComponent);
    dialogRef = fixture.debugElement.injector.get(MatDialogRef);
    toastrService = fixture.debugElement.injector.get(ToastrService);
    requestService = fixture.debugElement.injector.get(RequestService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('close - should close popup', () => {
    spyOn(toastrService, 'clear');
    spyOn(dialogRef, 'close');

    component.close();

    expect(dialogRef.close).toHaveBeenCalled();
    expect(toastrService.clear).toHaveBeenCalled();
  });

  it('ngOnInit - should show warning when not exist match to move ', async () => {
    spyOn(requestService, 'getMatchDetailThirdPartyBetTickets').and.returnValue(of([]));
    spyOn(toastrService, 'warning');
    component.data.refundType = RefundType.refundBetDaq;

    await component.ngOnInit();

    expect(component.title).toEqual('Betdaq');
    expect(toastrService.warning).toHaveBeenCalledWith(Language.soccer.emptyMatchToMove);

  });

  describe('moveBet', () => {
    it('should show error when not exist match selected', () => {
      component.matchIdSelected = null;
      spyOn(toastrService, 'error');
      spyOn(toastrService, 'clear');

      component.moveBet();

      expect(toastrService.error).toHaveBeenCalledWith(Language.soccer.chooseNewMatchError);
      expect(toastrService.clear).toHaveBeenCalled();
    });

    it('should move match when exist match selected', fakeAsync(async () => {
      component.matchIdSelected = 1000;
      component.data.matchId = 2000;
      const matchCode = '123456';
      matchMoveBet.matchCode = matchCode;
      matchMoveBet.matchId = 1000;
      component.listMatch = [matchMoveBet];
      component.title = 'BetFair';
      spyOn(requestService, 'moveBetType').and.returnValue(of(result));
      spyOn(dialogRef, 'close');

      await component.moveBet();
      tick();

      expect(requestService.moveBetType).toHaveBeenCalledWith(2000, 1000,'123456', 'BETFAIR');
      expect(dialogRef.close).toHaveBeenCalledWith({result});
    }));
  });
});
