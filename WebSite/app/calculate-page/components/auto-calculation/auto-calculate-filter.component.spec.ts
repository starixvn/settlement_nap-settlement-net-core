import { Match } from './../../../tennis/models/match.model';
import { FilterAutoQuery } from './../../models/filter-auto-query.model';
import { Statuses } from './../../Constants/status.native';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { AutoCalculateFilterComponent } from './auto-calculate-filter.component';
import { DatepickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { ModalDialogComponent, NewMultipleSelectComponent } from "../../../shared/components";
import { NgbDateStruct, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpRequestService, BlockUIService, MessageBoxService, VerifyDateService } from '../../../shared/services';
import { RequestService } from '../../services';
import { BackGroundService, DetectChangesService } from './../../services';
import { MaterialModule } from '../../../shared/material-module';
import { AutoCalculateService } from './auto-calculate.service';
import { DateFilter, ItemsSelect, League } from '../../../shared/models';
import { of } from 'rxjs';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { Calculation } from '../../models';
import { EPERM } from 'constants';

describe('AutoCalculateFilterComponent', () => {
  let component: AutoCalculateFilterComponent;
  let fixture: ComponentFixture<AutoCalculateFilterComponent>;
  let autoCalculateService: AutoCalculateService;
  let requestService: RequestService;
  let verifyDateService: VerifyDateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AutoCalculateFilterComponent,
        DatepickerComponent,
        ModalDialogComponent,
        NewMultipleSelectComponent],
      providers: [
        MessageBoxService,
        VerifyDateService,
        RequestService,
        HttpRequestService,
        BlockUIService,
        BackGroundService,
        DetectChangesService,
        AutoCalculateService
      ],
      imports: [
        FormsModule,
        HttpClientModule,
        NgbModule,
        MaterialModule
      ],
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ModalDialogComponent],
      },
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoCalculateFilterComponent);
    component = fixture.componentInstance;
    autoCalculateService = fixture.debugElement.injector.get(AutoCalculateService);
    requestService = fixture.debugElement.injector.get(RequestService);
    verifyDateService = fixture.debugElement.injector.get(VerifyDateService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  describe('ngOnInit', () => {
    it('should set default value for filter', () => {
      const item = new ItemsSelect(1, '1', 'text', false, false, false, []);
      spyOn(autoCalculateService, 'createAutoPayoutFilter').and.returnValue([item]);

      component.ngOnInit();

      expect(component.payoutSelect.items.length).toEqual(1);
      expect(component.query.statusId).toEqual(0);
      expect(component.query.leagueId).toEqual('0');
      expect(component.statuses.length).toEqual(Statuses.length - 1)
    });

    it('should return date and number item as expected.', fakeAsync(() => {
      const dateServer: DateFilter = {
        fromDate: "2020/06/19 00:00:00",
        toDate: "2020/06/20 00:00:00",
      };

      const leagues: League[] = [{ leagueId: 2, leagueName: "League", sportType: 1, sportName: "Soccer", group: "1" }];
      spyOn(requestService, 'getDate').and.returnValue(of(dateServer));
      spyOn(requestService, 'getLeague').and.returnValue(of(leagues));
      component.ngOnInit();
      tick();

      fixture.whenStable()
        .then(() => {
          expect(component.fromDate).toEqual({ year: 2020, month: 6, day: 19 });
          expect(component.toDate).toEqual({ year: 2020, month: 6, day: 20 });
          expect(component.leagues.length).toBeGreaterThanOrEqual(1);
        });
    }));
  });

  describe('onSelectFromDate', () => {
    it('should return right value League correct date.', fakeAsync(() => {
      const league = new League();
      const date = new Date();
      const fromDate: NgbDateStruct = { day: date.getUTCDay(), month: date.getUTCMonth(), year: date.getUTCFullYear() };
      league.leagueId = 1;
      league.leagueName = "mockName";
      const leagues: League[] = [league, league];

      spyOn(requestService, 'getLeague').and.returnValue(of(leagues));
      spyOn(verifyDateService, 'validDate').and.returnValue(true);
      component.onSelectFromDate(fromDate);
      tick();

      expect(component.leagues.length).toEqual(3);
    }));

    it('should return none League when date not valid.', fakeAsync(() => {
      const date = new Date();
      const fromDate: NgbDateStruct = { day: date.getUTCDay(), month: date.getUTCMonth(), year: date.getUTCFullYear() };
      spyOn(verifyDateService, 'validDate').and.returnValue(false);
      component.onSelectFromDate(fromDate);
      tick();

      expect(component.leagues.length).toEqual(1);
      expect(component.leagues[0].leagueId).toEqual(0);
    }));
  });

  describe('onSelectToDate', () => {
    it('should return right value League correct date.', fakeAsync(() => {
      const league = new League();
      const date = new Date();
      const fromDate: NgbDateStruct = { day: date.getUTCDay(), month: date.getUTCMonth(), year: date.getUTCFullYear() };
      league.leagueId = 1;
      league.leagueName = "mockName";
      const leagues: League[] = [league, league];

      spyOn(requestService, 'getLeague').and.returnValue(of(leagues));
      spyOn(verifyDateService, 'validDate').and.returnValue(true);
      component.onSelectToDate(fromDate);
      tick();

      expect(component.leagues.length).toEqual(3);
    }));

    it('should return none League when date not valid.', fakeAsync(() => {
      const date = new Date();
      const fromDate: NgbDateStruct = { day: date.getUTCDay(), month: date.getUTCMonth(), year: date.getUTCFullYear() };
      spyOn(verifyDateService, 'validDate').and.returnValue(false);
      component.onSelectToDate(fromDate);
      tick();

      expect(component.leagues.length).toEqual(1);
      expect(component.leagues[0].leagueId).toEqual(0);
    }));
  });

  it('search - should call get match and emit value', fakeAsync(() => {
    const calculation = [new Calculation()];
    component.fromDate = { year: 2020, month: 6, day: 20};
    component.toDate = { year: 2020, month: 6, day: 20};
    spyOn(requestService, 'searchAutoCalculation').and.returnValue(of(calculation));
    spyOn(component.searchAction, 'emit');

    component.search();
    tick();

    expect(requestService.searchAutoCalculation).toHaveBeenCalled();
    expect(component.searchAction.emit).toHaveBeenCalledWith({calculation, filterQuery: component.query});
  }));

  describe('onSelectHoldStatus() method', () => {

    it('should return right value when selected.', () => {
        const items: ItemsSelect[] = [];
        items.push(new ItemsSelect(1, "1", "1", true, true, true, []));
        items.push(new ItemsSelect(2, "2", "2", true, true, true, []));
        component.onSelectPayout(items);

        expect(component.query.autoSetting).toEqual("1,2");
    });

    it('should return default value when not selected.', () => {
        const items: ItemsSelect[] = [];
        component.onSelectPayout(items);

        expect(component.query.autoSetting).toEqual("");
    });
});
});
