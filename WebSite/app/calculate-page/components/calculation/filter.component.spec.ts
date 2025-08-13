import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DatepickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { ModalDialogComponent } from "../../../shared/components/modal-dialog/modal-dialog.component";
import { NewMultipleSelectComponent } from "../../../shared/components/multiple-select/multiple-select.component";
import { NgbDateStruct, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FilterComponent } from './filter.component';
import { HttpRequestService, BlockUIService, MessageBoxService, VerifyDateService } from '../../../shared/services';
import { RequestService } from '../../services';
import { GenerateFilterService, BackGroundService, DetectChangesService } from './../../services';
import { MaterialModule } from '../../../shared/material-module';
import { DateFilter, ItemsSelect, ModalDialogMessage,League } from '../../../shared/models';
import { of } from 'rxjs';
import { Language } from '../../../shared/language.native';
import { DatePipe } from '@angular/common';
describe('FilterComponent', () => {
    let component: FilterComponent;
    let fixture: ComponentFixture<FilterComponent>;
    let requestService: RequestService;
    let verifyDateService: VerifyDateService;
    let messageBoxService: MessageBoxService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                FilterComponent,
                DatepickerComponent,
                ModalDialogComponent,
                NewMultipleSelectComponent,
                FormsModule,
                HttpClientModule,
                NgbModule,
                MaterialModule,
                NoopAnimationsModule
            ],
            providers: [
                MessageBoxService,
                VerifyDateService,
                RequestService,
                GenerateFilterService,
                HttpRequestService,
                BlockUIService,
                BackGroundService,
                DetectChangesService,
                DatePipe
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FilterComponent);
        component = fixture.componentInstance;
        requestService = fixture.debugElement.injector.get(RequestService);
        verifyDateService = fixture.debugElement.injector.get(VerifyDateService);
        messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
        jest.spyOn(messageBoxService, 'alert').mockImplementation(() => {});
        
        // Initialize component properties
        component.query = {
            fromDate: "2020/06/19 00:00:00",
            toDate: "2020/06/20 00:00:00",
            matchCode: "1",
            leagueIds: "1",
            filterOver: 1,
            matchType: 2,
            matchStatus: "0",
            holdStatus: "0",
            isIncludeTest: false
        };
        
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return date and number item as expected.', fakeAsync(() => {
        const dateServer: DateFilter = {
            fromDate: "2020/06/19 00:00:00",
            toDate: "2020/06/20 00:00:00",
        };

        const leagues: League[] = [{ leagueId: 2, leagueName: "League", sportType: 1, sportName: "Soccer", group: "1" }];
        jest.spyOn(requestService, 'getDate').mockResolvedValue(dateServer);
        jest.spyOn(requestService, 'getLeague').mockResolvedValue(leagues);
        component.ngOnInit();
        tick();

        fixture.whenStable()
            .then(() => {
                expect(component.fromDate).toEqual({ year: 2020, month: 6, day: 19 });
                expect(component.toDate).toEqual({ year: 2020, month: 6, day: 20 });
                expect(component.leagues.length).toEqual(1);
            });
    }));

    describe('search method', () => {
        it('should show error message when validation fails', () => {
            // Initialize component properties with empty values to trigger validation
            component.query = {
                fromDate: "2020/06/19 00:00:00",
                toDate: "2020/06/20 00:00:00",
                matchCode: "", // Empty matchCode
                leagueIds: "0", // Default value
                filterOver: 0, // Default value
                matchType: 0, // Default value
                matchStatus: "0",
                holdStatus: "0",
                isIncludeTest: false
            };
            jest.spyOn(verifyDateService, 'validDate').mockReturnValue(true);

            component.search();

            expect(messageBoxService.alert).toHaveBeenCalled();
        });

        it('should call filter method and event emit when pass all validation.', fakeAsync(() => {
            jest.spyOn(requestService, 'search').mockResolvedValue({} as any);
            jest.spyOn(verifyDateService, 'validDate').mockReturnValue(true);
            jest.spyOn(component.searchAction, 'emit');
            jest.spyOn(component.disableRefund, 'emit');

            // Initialize component properties with valid values
            component.query = {
                fromDate: "2020/06/19 00:00:00",
                toDate: "2020/06/20 00:00:00",
                matchCode: "1", // Non-empty matchCode
                leagueIds: "1", // Non-default value
                filterOver: 1, // Non-default value
                matchType: 2, // Non-default value
                matchStatus: "0",
                holdStatus: "0",
                isIncludeTest: false
            };

            component.search();
            tick();

            expect(component.searchAction.emit).toHaveBeenCalled();
            expect(component.disableRefund.emit).toHaveBeenCalled();
        }));
    });

    describe('onSelectLeague() method', () => {
        it('should return right value when selected.', () => {
            const items: ItemsSelect[] = [];
            items.push(new ItemsSelect(1, "2", "1", true, true, true, []));
            component.onSelectLeague(items);

            expect(component.query.leagueIds).toEqual("2");
        });

        it('should return default value when not selected.', () => {
            const items: ItemsSelect[] = [];
            component.onSelectLeague(items);

            expect(component.query.leagueIds).toEqual("0");
        });
    });

    describe('onSelectMatchStatus() method', () => {
        it('should return right value when selected.', () => {
            const items: ItemsSelect[] = [];
            items.push(new ItemsSelect(1, "2", "1", true, true, true, []));
            component.onSelectMatchStatus(items);

            expect(component.query.matchStatus).toEqual("2");
        });

        it('should return default value when not selected.', () => {
            const items: ItemsSelect[] = [];
            component.onSelectMatchStatus(items);

            expect(component.query.matchStatus).toEqual("0");
        });
    });

    describe('onSelectHoldStatus() method', () => {
        it('should return right value when selected.', () => {
            const items: ItemsSelect[] = [];
            items.push(new ItemsSelect(1, "2", "1", true, true, true, []));
            component.onSelectHoldStatus(items);

            expect(component.query.holdStatus).toEqual("2");
        });

        it('should return default value when not selected.', () => {
            const items: ItemsSelect[] = [];
            component.onSelectHoldStatus(items);

            expect(component.query.holdStatus).toEqual("0");
        });
    });

    describe('onSelectFromDate', () => {
        it('should return right value leagues correct date.', () => {
            const date = new Date();
            const league = new League();
            league.leagueId = 12345;
            const fromDate: NgbDateStruct = { day: date.getUTCDay(), month: date.getUTCMonth(), year: date.getUTCFullYear() };
            jest.spyOn(requestService, 'getLeague').mockResolvedValue([league]);
            jest.spyOn(verifyDateService, 'validDate').mockReturnValue(true);

            // Initialize component properties
            component.query = {
                fromDate: "2020/06/19 00:00:00",
                toDate: "2020/06/20 00:00:00",
                matchCode: "1",
                leagueIds: "1",
                filterOver: 1,
                matchType: 2,
                matchStatus: "0",
                holdStatus: "0",
                isIncludeTest: false
            };

            component.onSelectFromDate(fromDate);

            expect(component.query.fromDate).toBeDefined();
        });
    });

    describe('onSelectToDate', () => {
        it('should return right value leagues correct date.', () => {
            const date = new Date();
            const league = new League();
            league.leagueId = 12345;
            const toDate: NgbDateStruct = { day: date.getUTCDay(), month: date.getUTCMonth(), year: date.getUTCFullYear() };
            jest.spyOn(requestService, 'getLeague').mockResolvedValue([league]);
            jest.spyOn(verifyDateService, 'validDate').mockReturnValue(false);

            // Initialize component properties
            component.query = {
                fromDate: "2020/06/19 00:00:00",
                toDate: "2020/06/20 00:00:00",
                matchCode: "1",
                leagueIds: "1",
                filterOver: 1,
                matchType: 2,
                matchStatus: "0",
                holdStatus: "0",
                isIncludeTest: false
            };

            component.onSelectToDate(toDate);

            expect(component.query.toDate).toBeDefined();
        });
    });

});
