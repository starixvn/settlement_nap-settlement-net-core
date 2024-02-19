import { ComponentFixture, TestBed, fakeAsync, waitForAsync } from "@angular/core/testing";
import { LeagueComponent } from "./league.component";
import { MultiSportsStore } from "../../../services/multi-sports.store";
import { BackGroundService, DetectChangesService, HandleActionsService, MultiSportService, PopupService, RefreshMatchService } from "../../../services";
import { BlockUIService, DialogBoxService, HttpRequestService, MessageBoxService } from "../../../../shared/services";
import { HttpClientModule } from "@angular/common/http";
import { Permission } from "../../../models/permission.model";
import { AutoSetting } from "../../../../shared/models";
import { LeagueMatch } from "../../../models";
import { MatDialogModule } from "@angular/material/dialog";
import { MatchStateService } from "../../../services/match-state.service";
import { IntervalScorePipe } from "../../../../shared/pipes/interval-score.pipe";

describe('LeagueComponent', () => {
  let component: LeagueComponent;
  let fixture: ComponentFixture<LeagueComponent>;
  let store : MultiSportsStore;
  let popupService: PopupService;
  let permission = new Permission();
  const league: LeagueMatch = {
    leagueId: 7000000,
    matches: [],
    name: 'mock league',
    collapse: false,
    autoCalcSetting: new AutoSetting(),
    sportType: 0,
    autoWaitingTime: 0,
    autoRetryTime: 0
  };
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        MultiSportService,
        HandleActionsService,
        MessageBoxService,
        PopupService,
        HttpRequestService,
        BlockUIService,
        DialogBoxService,
        RefreshMatchService,
        DetectChangesService,
        MatchStateService,
        IntervalScorePipe,
        BackGroundService
      ],
      imports: [
        LeagueComponent,
        HttpClientModule,
        MatDialogModule
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeagueComponent);
    component = fixture.componentInstance;
    store = fixture.debugElement.injector.get(MultiSportsStore);
    popupService = fixture.debugElement.injector.get(PopupService);
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('changeAutoLeague', () => {
    it('should do nothing when not having permission', () => {
      permission.canAutoPayout = false;
      component.permission = permission;
      popupService.openUpdatePayoutForLeague = jest.fn();

      component.changeAutoLeague(league);

      expect(popupService.openUpdatePayoutForLeague).not.toHaveBeenCalled();
    });

    it('should update popup change setting when has permission', () => {
      permission.canAutoPayout = true;
      component.permission = permission;
      popupService.openUpdatePayoutForLeague = jest.fn();

      component.changeAutoLeague(league);

      expect(popupService.openUpdatePayoutForLeague).toHaveBeenCalled();
    });
  });
});