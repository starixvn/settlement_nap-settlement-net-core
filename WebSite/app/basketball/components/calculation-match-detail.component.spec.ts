import { TestBed, waitForAsync, ComponentFixture } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CalculationMatchDetailComponent } from './calculation-match-detail.component';
import { Match } from '../models';
import { MessageBoxService, HttpRequestService, BlockUIService, AioService, ClosePopupService } from '../../shared/services';
import { ManageLeagueComponent } from '../../score-source-setting/components';
import { MaterialModule } from '../../shared/material-module';
import { MatDialog } from '@angular/material/dialog';
import { MatchDetail } from '../../shared/models/sportsbook-sop';
import { LeagueOutsideSource } from '../../score-source-setting/models';

describe('Component: CalculationMatchDetail', () => {
  let component: CalculationMatchDetailComponent;
  let fixture: ComponentFixture<CalculationMatchDetailComponent>;
  let aioService: AioService;
  let dialog: MatDialog;
  const matchDetail = new MatchDetail();
  const match = new Match(matchDetail);
  const source = new LeagueOutsideSource();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        MessageBoxService,
        HttpRequestService,
        BlockUIService,
        AioService,
        ClosePopupService,
        NgbModal
      ],
      imports: [FormsModule, HttpClientModule, MaterialModule, CalculationMatchDetailComponent, ManageLeagueComponent],
    }).compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(CalculationMatchDetailComponent);
        component = fixture.componentInstance;
        component.match = match;
        aioService = fixture.debugElement.injector.get(AioService);
        dialog = fixture.debugElement.injector.get(MatDialog);
      });
  }));

  it('should create the app', waitForAsync(() => {
    expect(component).toBeTruthy();
  }));

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
