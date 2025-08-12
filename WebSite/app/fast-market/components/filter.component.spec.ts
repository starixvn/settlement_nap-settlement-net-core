import { TestBed, waitForAsync, ComponentFixture} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ElementRef, SimpleChange, SimpleChanges } from "@angular/core";
import { ModalDialogComponent } from '../../shared/components/modal-dialog/modal-dialog.component';
import { ModalContentDialogComponent } from '../../shared/components/modal-dialog/modal-content-dialog.component';
import { NewMultipleSelectComponent } from '../../shared/components/multiple-select/multiple-select.component';
import { FilterComponent } from './filter.component';
import { ItemSelect } from '../models';
import { MessageBoxService, HttpRequestService, BlockUIService } from '../../shared/services';
import { RequestService } from '../services/request.service';
import { MultipleSelect, ItemsSelect } from '../../shared/models';
import { Filter } from '../models';

describe('Component: FilterComponent', () => {
    let component: FilterComponent;
    let fixture: ComponentFixture<FilterComponent>;
    let fastMarketService: RequestService;
    let multipleSelectComponent: NewMultipleSelectComponent;
    const buttonName = "btn-danger";
    const errorMessage = "Error message";
    const filter = new Filter();
    filter.checked = false;
    const childItemSelect = {
        id: 7000000,
        value: '',
        text: '',
        checked: false,
        enable: false,
        items: [],
    };
    const itemSelect: ItemSelect = {
        id: 7000000,
        value: '',
        text: '',
        checked: false,
        enable: false,
        items: [childItemSelect],
    };
    const childItemsSelect = new ItemsSelect(7000000, '', '', false, true, false, []);
    const itemsSelect = new ItemsSelect(7000000, '', '', false, true, false, [childItemsSelect]);
    filter.resultStatus = [itemSelect];
    filter.interval = [itemSelect];
    const resultStatusSelect = new MultipleSelect();
    resultStatusSelect.items = [itemsSelect];
    resultStatusSelect.maxWidth = '160px';
    const timeIntervalSelect = new MultipleSelect();
    const flattenedItem = new ItemsSelect(7000000, '', '', false, true, false, []);
    flattenedItem.type = '7000000';
    timeIntervalSelect.items = [flattenedItem];
    timeIntervalSelect.maxWidth = '130px';
    timeIntervalSelect.haveGroup = true;
    const ticketStatusSelect = new MultipleSelect();
    ticketStatusSelect.items = [
        new ItemsSelect(2, '2', 'Running', true, true, true, []),
        new ItemsSelect(3, '3', 'Calculated', true, true, true, []),
        new ItemsSelect(5, '5', 'Marked', true, true, true, []),
        new ItemsSelect(4, '4', 'No Ticket', false, true, true, []),
    ];
    ticketStatusSelect.maxWidth = '150px';
    ticketStatusSelect.selectionTitle = 'Running, Calculated, Marked';
    const successfulResult = {
        errCode: 0,
        errMsg: "",
        isSuccessful: true,
    };

    const unSuccessfulResult = {
        errCode: 1,
        errMsg: errorMessage,
        isSuccessful: false,
    };

    class MockElementRef implements ElementRef {
        nativeElement = {};
      }

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                FilterComponent,
            ],
            providers: [
                HttpRequestService,
                BlockUIService,
                RequestService,
                NgbModal,
                { provide: MessageBoxService, useClass: MessageBoxService },
                { provide: ElementRef , useValue: new MockElementRef()} ,
            ],
            imports: [
                FormsModule,
                HttpClientModule,
                NgbModule,
                ModalDialogComponent,
                ModalContentDialogComponent,
                NewMultipleSelectComponent,
            ],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(FilterComponent);
                component = fixture.componentInstance;
                fastMarketService = TestBed.inject(RequestService);
            });
    }));

    it('should create the app', waitForAsync(() => {
        expect(component).toBeTruthy();
    }));

    it('ngOnInit - should set filter properties correctly', async () => {
        jest.spyOn(fastMarketService, 'getFilterData').mockResolvedValue(filter);

        component.ngOnInit();
        
        // Wait for the async operation to complete
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(component.filter.checked).toEqual(filter.checked);
        itemsSelect.items = [];
        expect(component.resultStatusSelect).toEqual(resultStatusSelect);
        itemsSelect.items = [childItemsSelect];
        expect(component.ticketStatusSelect).toEqual(ticketStatusSelect);
        expect(component.timeIntervalSelect).toEqual(timeIntervalSelect);
    });

    it('onChangeProceed - should emit event', () => {
        jest.spyOn(component.onProceedEvent, 'emit');

        component.onChangeProceed(true);

        expect(component.onProceedEvent.emit).toHaveBeenCalled();
    });

    it('changeTimeInterval - should emit event', () => {
        const value = [new ItemsSelect(1, '1', '1', true, true, true, [])];
        jest.spyOn(component.intervalEvent, 'emit');

        component.changeTimeInterval(value);

        expect(component.intervalEvent.emit).toHaveBeenCalled();
    });

    it('changeTicketStatus - should emit event', () => {
        const value = [new ItemsSelect(1, '1', '1', true, true, true, [])];
        jest.spyOn(component.ticketStatusEvent, 'emit');

        component.changeTicketStatus(value);

        expect(component.ticketStatusEvent.emit).toHaveBeenCalled();
    });

    it('changeResultStatus - should emit event', () => {
        const value = [new ItemsSelect(1, '1', '1', true, true, true, [])];
        jest.spyOn(component.resultStatusEvent, 'emit');

        component.changeResultStatus(value);

        expect(component.resultStatusEvent.emit).toHaveBeenCalled();
    });

    describe('ngOnChanges', () => {
        it('should update interval selection', () => {
            const changes: SimpleChanges = {};
            component.positions = [1, 2, 3];
            changes.positions = new SimpleChange(1, 2, true);
            const timeInterval = new MultipleSelect();
            const subItem1 = new ItemsSelect(0, '', '', false, false, false, []);
            const subItem2 = new ItemsSelect(0, '', '', true, false, false, []);
            const item = new ItemsSelect(0, '', '', true, false, false, [subItem1, subItem2]);
            timeInterval.items = [item];
            component.timeIntervalSelect = timeInterval;
            jest.spyOn(component.intervalEvent, 'emit');

            component.ngOnChanges(changes);

            expect(component.intervalEvent.emit).toHaveBeenCalled();
        });

        it('should update interval selection by water break', () => {
            const changes: SimpleChanges = {};
            component.isApplySpecialSession = true;
            changes.isApplySpecialSession = new SimpleChange(false, true, true);
            const timeInterval = new MultipleSelect();
            const subItem1 = new ItemsSelect(1, '', '', false, false, false, []);
            const subItem2 = new ItemsSelect(0, '', '', true, false, false, []);
            const item = new ItemsSelect(0, '', '', true, false, false, [subItem1, subItem2]);
            timeInterval.items = [item];
            component.specialSessionPositions = [1, 2];
            component.timeIntervalSelect = timeInterval;
            jest.spyOn(component.intervalEvent, 'emit');

            component.ngOnChanges(changes);

            expect(component.intervalEvent.emit).toHaveBeenCalled();
        });
    });
});
