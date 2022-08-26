import { TestBed, waitForAsync, ComponentFixture } from "@angular/core/testing";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import {
  HttpRequestService,
  BlockUIService,
  MessageBoxService,
  AioService,
  ClosePopupService
} from "../../shared/services";
import { MaterialModule } from "../../shared/material-module";
import { of } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { MatchDetail, ResultDetail } from "../../shared/models/sportsbook-sop";
import { LeagueOutsideSource } from "../../score-source-setting/models";
import { ManageLeagueComponent } from "../../score-source-setting/components";
import { ResultByTeamNamePipe } from "../../shared/pipes/result-by-team-name.pipe";
import { CalculationMatchDetailComponent } from "./calculation-match-detail.component";
import { Match } from "../models";

export class CreateDataTest {
  public static CreateResultDetail(
    id: string,
    home: string,
    away: string,
    ticketStatus: string,
    settlementStatusId: number
  ) {
    const item = new ResultDetail();
    item.resourceId = id;
    item.homeValue = home;
    item.awayValue = away;
    item.ticketStatus = ticketStatus;
    item.settlementStatusId = settlementStatusId;
    return item;
  }
}

describe("E-sport - Calculation Match Detail Component", () => {
  let component: CalculationMatchDetailComponent;
  let fixture: ComponentFixture<CalculationMatchDetailComponent>;
  let aioService: AioService;
  let dialog: MatDialog;
  const matchDetail = new MatchDetail();
  const match = new Match(matchDetail);
  const source = new LeagueOutsideSource();
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CalculationMatchDetailComponent, ManageLeagueComponent],
      providers: [
        MessageBoxService,
        HttpRequestService,
        BlockUIService,
        AioService,
        NgbModal,
        ClosePopupService,
        ResultByTeamNamePipe,
        { provide: MessageBoxService, useClass: MessageBoxService },
      ],
      imports: [FormsModule, HttpClientModule, MaterialModule],
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ManageLeagueComponent],
      },
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(CalculationMatchDetailComponent);
        component = fixture.componentInstance;
        component.match = match;
        aioService = fixture.debugElement.injector.get(AioService);
        dialog = fixture.debugElement.injector.get(MatDialog);
      });
  }));

  it("should create the app", () => {
    expect(component).toBeTruthy();
  });

  it("ngOnInit - should set match detail", () => {
    component.ngOnInit();

    expect(component.matchDetail).toEqual(match.matchDetail);
  });

  it("manageOutSideSourcePopup -should call getLeagueSources from aioService.", () => {
    matchDetail.leagueId = 123;
    component.matchDetail = matchDetail;
    spyOn(aioService, "getLeagueSources").and.returnValue(of(source));
    spyOn(dialog, "open");

    component.manageOutSideSourcePopup();

    expect(aioService.getLeagueSources).toHaveBeenCalled();
    expect(dialog.open).toHaveBeenCalled();
  });
});