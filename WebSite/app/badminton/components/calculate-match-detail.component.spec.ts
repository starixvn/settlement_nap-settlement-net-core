import {ComponentFixture, TestBed} from '@angular/core/testing';
import { of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CalculateMatchDetailComponent } from './calculate-match-detail.component';
import { HttpClientModule } from '@angular/common/http';
import { HttpRequestService, BlockUIService, MessageBoxService, AioService, ClosePopupService } from '../../shared/services';
import { Match } from '../models';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { MatchDetail } from '../../shared/models/sportsbook-sop';
import { MatDialog } from '@angular/material/dialog';
import { LeagueOutsideSource } from '../../score-source-setting/models';
import { ManageLeagueComponent } from '../../score-source-setting/components';
import { MaterialModule } from '../../shared/material-module';

describe('Badminton - Calculation Match Detail Component', () => {
  let component: CalculateMatchDetailComponent;
  let fixture: ComponentFixture<CalculateMatchDetailComponent>;
  let aioService: AioService;
  let dialog: MatDialog;
  const matchDetail = new MatchDetail();
  const match = new Match(matchDetail);
  const source = new LeagueOutsideSource();
  beforeEach(async() => {
    await TestBed.configureTestingModule({
      providers: [
        MessageBoxService,
        HttpRequestService,
        BlockUIService,
        AioService,
        ClosePopupService,
        NgbModal,
        { provide: MessageBoxService, useClass: MessageBoxService },
      ],
      imports: [FormsModule, HttpClientModule, MaterialModule, CalculateMatchDetailComponent, ManageLeagueComponent],
    }) .overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ManageLeagueComponent],
      },
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(CalculateMatchDetailComponent);
        component = fixture.componentInstance;
        component.match = match;
        aioService = fixture.debugElement.injector.get(AioService);
        dialog = fixture.debugElement.injector.get(MatDialog);
      });
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("manageOutSideSourcePopup - should call getLeagueSources from aioService.", () => {
    matchDetail.leagueId = 123;
    component.matchDetail = matchDetail;
    jest.spyOn(aioService, "getLeagueSources").mockReturnValue(of(source));
    dialog.open = jest.fn();

    component.manageOutSideSourcePopup();

    expect(aioService.getLeagueSources).toHaveBeenCalled();
    expect(dialog.open).toHaveBeenCalled();
  });
});
