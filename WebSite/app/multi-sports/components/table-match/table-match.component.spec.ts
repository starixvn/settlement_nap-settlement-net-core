import { State } from './../../../fast-market/constants/settings.native';
import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';

import { TableMatchComponent } from './table-match.component';
import { MultiSportsStore } from '../../services/multi-sports.store';
import { MultiSport, SportMatch } from '../../models';
import { BackGroundService, DetectChangesService, RefreshMatchService } from '../../services';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../../shared/services';
import { HttpClientModule } from '@angular/common/http';
import { MatchStateService } from '../../services/match-state.service';
import { IntervalScorePipe } from '../../../shared/pipes/interval-score.pipe';

describe('TableMatchComponent', () => {
  let component: TableMatchComponent;
  let fixture: ComponentFixture<TableMatchComponent>;
  let store: MultiSportsStore;
  let refreshMatchesService: RefreshMatchService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableMatchComponent, HttpClientModule, IntervalScorePipe],
      providers: [
        RefreshMatchService,
        HttpRequestService,
        BlockUIService,
        MessageBoxService,
        DetectChangesService,
        MatchStateService,
        IntervalScorePipe,
        BackGroundService,
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TableMatchComponent);
    component = fixture.componentInstance;
    store = fixture.debugElement.injector.get(MultiSportsStore);
    refreshMatchesService = fixture.debugElement.injector.get(RefreshMatchService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should trigger refresh match by interval', fakeAsync(() => {
      store.enableRefresh = true;
      refreshMatchesService.refreshMatches = jest.fn();

      component.ngOnInit();
      tick(6000);
      component.ngOnDestroy();
      flush();

      expect(refreshMatchesService.refreshMatches).toHaveBeenCalled();
    }));

    it('should take value from observable', () => {
      store.setState(new MultiSport());

      component.ngOnInit();

      store.setState({ ...store.state, sports: [new SportMatch()] });

      expect(component.sports.length).toEqual(1);
    });
  });

  it('collapseSport - change state collapse of sport', () => {
    const sport = new SportMatch();

    component.collapseSport(sport);

    expect(sport.collapse).toBeTruthy();
  });
});
