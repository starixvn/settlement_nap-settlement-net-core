import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CalculateMatchDetailComponent } from './calculate-match-detail.component';
import { ResourceHeaderPipe, ExternalHeaderPipe, ResourceNameByIdPipe } from '../pipes';
import { HttpClientModule } from '@angular/common/http';
import { Match } from '../models';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { MatchDetail } from '../../shared/models/sportsbook-sop';
import { ManageLeagueComponent } from '../../score-source-setting/components';
import { LeagueOutsideSource } from '../../score-source-setting/models';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { MaterialModule } from '../../shared/material-module';
import { AioService, BlockUIService, ClosePopupService, HttpRequestService, MessageBoxService } from '../../shared/services';
import { TicketCountComponent } from '../../shared/components/ticket-count/ticket-count.component';

describe('Tennis - Calculation Match Detail Component', () => {
  let component: CalculateMatchDetailComponent;
  let fixture: ComponentFixture<CalculateMatchDetailComponent>;
  let aioService: AioService;
  let dialog: MatDialog;
  const matchDetail = new MatchDetail();
  const match = new Match(matchDetail);
  const source = new LeagueOutsideSource();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ExternalHeaderPipe,
      ],
      providers: [
        AioService,
        HttpRequestService,
        BlockUIService,
        MatDialog,
        ClosePopupService,
        { provide: MessageBoxService, useClass: MessageBoxService },
      ],
      imports: [
        CalculateMatchDetailComponent,
        ManageLeagueComponent,
        TicketCountComponent,
        ResourceHeaderPipe,
        ResourceNameByIdPipe,
        IntervalBackgroundPipe,
        FormsModule,
        HttpClientModule,
        MaterialModule
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(CalculateMatchDetailComponent);
        component = fixture.componentInstance;
        aioService = fixture.debugElement.injector.get(AioService);
        dialog = fixture.debugElement.injector.get(MatDialog);
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("ngOnInit - should set match detail", () => {
    component.match = match;
    component.ngOnInit();

    expect(component.matchDetail).toEqual(match.matchDetail);
  });

  it("manageOutSideSourcePopup - should call getLeagueSources from aioService.", () => {
    matchDetail.leagueId = 123;
    component.matchDetail = matchDetail;

    aioService.getLeagueSources = jest.fn().mockReturnValue(of(source));
    dialog.open = jest.fn();

    component.manageOutSideSourcePopup();

    expect(aioService.getLeagueSources).toHaveBeenCalled();
    expect(dialog.open).toHaveBeenCalled();
  });
});
