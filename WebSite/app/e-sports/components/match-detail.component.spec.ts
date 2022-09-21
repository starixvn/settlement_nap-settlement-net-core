import { TestBed, waitForAsync, ComponentFixture, tick, fakeAsync } from "@angular/core/testing";
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { ResourceNameByIdPipe} from "../pipes";
import { MatchDetailComponent } from ".";
import {
  HttpRequestService,
  BlockUIService,
  MessageBoxService,
} from "../../shared/services";
import { ScoreBySettlementPipe } from "../../shared/pipes/score-by-settlement.pipe";
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { Match} from "../models";
import { of } from "rxjs";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { ModalContentDialogComponent, ModalDialogComponent } from "../../shared/components";
import { MatchDetail, Permission, ResultDetail } from "../../shared/models/sportsbook-sop";
import { ResultByTeamNamePipe } from "../../shared/pipes/result-by-team-name.pipe";
import { VerificationBaseService } from '../../core/services/verification-base.service';

describe("E-sport - Refund Match Detail Component", () => {
  let component: MatchDetailComponent;
  let verificationBaseService: VerificationBaseService;
  let messageBoxService: MessageBoxService;
  let fixture: ComponentFixture<MatchDetailComponent>;
  const matchDetail = new MatchDetail();
  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [
        MatchDetailComponent,
        ResourceNameByIdPipe,
        ScoreBySettlementPipe,
        ModalDialogComponent,
        ModalContentDialogComponent
      ],
      providers: [
        MessageBoxService,
        VerificationBaseService,
        HttpRequestService,
        ResultByTeamNamePipe,
        BlockUIService,
        IntervalBackgroundPipe,
        NgbModal,
        { provide: MessageBoxService, useClass: MessageBoxService },
      ],
      imports: [FormsModule, HttpClientModule, NgbModule],
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
      },
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(MatchDetailComponent);
        component = fixture.componentInstance;
        verificationBaseService = fixture.debugElement.injector.get(VerificationBaseService);
        messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
      });
  }));

  it("should create the app", () => {
    expect(component).toBeTruthy();
  });

  it("should return list result detail with resourceId.length = 2", () => {
    const resultDetails: ResultDetail[] = [];
    const itemOne = new ResultDetail();
    itemOne.resourceId = "90620105";
    const itemTwo = new ResultDetail();
    itemTwo.resourceId = "456";
    const itemThree = new ResultDetail();
    itemThree.resourceId = "M1";

    resultDetails.push(itemOne);
    resultDetails.push(itemTwo);
    resultDetails.push(itemThree);
    matchDetail.matchId = 123;
    matchDetail.homeName = "1";
    component.match = new Match(matchDetail);
    component.match.permission = new Permission();
    component.match.permission.isLeader = true;
    component.match.resultDetails = resultDetails;
    component.ngOnInit();
    expect(component.resultDetails.length).toBe(1);
    expect(component.matchDetail).toBe(matchDetail);
  });

  describe('refresh.', () => {
    beforeEach(() => {
      component.match = new Match(matchDetail);
    })

    it('should call refreshPage when no result changed.', () => {
      component.match.matchDetail.isSavedScore = true;
      spyOn(verificationBaseService, 'getChangedScores').and.returnValue(of([]));
      spyOn(component, 'reloadPage');

      component.refresh();

      expect(component.reloadPage).toHaveBeenCalled();
    });

    it('should show confirmBox when have changed.', () => {
      const itemOne = new ResultDetail();
      component.match.matchDetail.isSavedScore = false;
      spyOn(verificationBaseService, 'getChangedScores').and.returnValue([itemOne]);
      spyOn(messageBoxService, 'confirm');

      component.refresh();

      expect(messageBoxService.confirm).toHaveBeenCalled();
      expect(component.confirmationDialogMessage.message).toEqual('WARNING! There are unsaved changes. Are you sure you want to proceed?');
    });

    it('should call reloadPage when user confirmed.', fakeAsync(() => {
      const itemOne = new ResultDetail();
      component.match.matchDetail.isSavedScore = false;
      spyOn(verificationBaseService, 'getChangedScores').and.returnValue([itemOne]);
      spyOn(component, 'reloadPage');

      component.refresh();
      const buttonYes = document.getElementsByClassName(
        "btn-danger"
      )[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(component.reloadPage).toHaveBeenCalled();
    }));
  });
});
