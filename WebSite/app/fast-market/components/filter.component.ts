import { Component, EventEmitter, Output, Input, OnInit, OnChanges, SimpleChanges, ViewChild, SimpleChange } from '@angular/core';
import { MultipleSelectComponent } from '../../shared/components';
import { ItemsSelect, MultipleSelect } from '../../shared/models';
import * as _ from 'lodash';
import { Filter, IntervalEvent, ItemSelect } from '../models';
import { RequestService } from '../services/request.service';
import { ResultStatus, SessionId } from '../constants';

@Component({
    selector: 'filter',
    templateUrl: './filter.component.html'
})

export class FilterComponent implements OnInit, OnChanges {
    public filter: Filter;
    public resultStatusSelect = new MultipleSelect();
    public timeIntervalSelect = new MultipleSelect();
    public ticketStatusSelect = new MultipleSelect();
    public initialTimeIntervalSelect: MultipleSelect;
    public initialResultStatusSelect: MultipleSelect;
    public initialTicketStatusSelect: MultipleSelect;

    @ViewChild(MultipleSelectComponent, {static: false}) public multipleSelectComponent: MultipleSelectComponent;
    @Input() public readonly checkedProceed: boolean;
    @Input() public positions: number[];
    @Input() public isApplySpecialSession: boolean;
    @Input() public specialSessionPositions: number[];
    @Input() public specialSessionType: string;
    @Output() public readonly onProceedEvent = new EventEmitter();
    @Output() public readonly intervalEvent = new EventEmitter();
    @Output() public readonly ticketStatusEvent = new EventEmitter();
    @Output() public readonly resultStatusEvent = new EventEmitter();

    constructor(private readonly requestService: RequestService) {
    }

    public ngOnInit() {
        this.configFilter();
        this.getFilterData();
    }

    public ngOnChanges(changes: SimpleChanges) {
        const pos = 'positions';
        const specialSession = 'isApplySpecialSession';
        const specialSessionPos = 'specialSessionPositions';
        if ((changes[specialSession] || changes[specialSessionPos]) && this.isApplySpecialSession) {
            this.selectIntervalFilterByWaterBreak();
            this.updateIntervalSelectionByWaterBreak();
            this.selectTicketStatusFilterBySpecialSession();
        }

        this.waterBreakUnchecked(changes[specialSession]);

        if (changes[specialSessionPos] && !this.isApplySpecialSession && !changes[specialSessionPos].firstChange) {
            this.selectIntervalFilterByWaterBreak();
            this.intervalEvent.emit(new IntervalEvent(this.specialSessionPositions));
        }

        if (changes[pos] && !_.isNil(this.positions)) {
            this.updateIntervalSelection();
        }
    }

    private waterBreakUnchecked(change: SimpleChange) {
        if (change && !this.isApplySpecialSession && !change.firstChange) {
            this.timeIntervalSelect = _.cloneDeep(this.initialTimeIntervalSelect);
            this.intervalEvent.emit(new IntervalEvent([]));
            this.ticketStatusSelect = _.cloneDeep(this.initialTicketStatusSelect);
            this.ticketStatusSelect.selectionTitle = this.ticketStatusSelect.getItemsDisplay();
            this.ticketStatusEvent.emit(["2", "3", "5"]);
            this.resultStatusSelect = _.cloneDeep(this.initialResultStatusSelect);
            this.resultStatusEvent.emit([]);
        }
    }

    public onChangeProceed(checked: boolean) {
        this.onProceedEvent.emit(checked);
    }

    private configFilter() {
        this.filter = new Filter();
        this.ticketStatusSelect.items = [];
        this.ticketStatusSelect.maxWidth = '150px';
        this.resultStatusSelect.items = [];
        this.resultStatusSelect.maxWidth = '160px';
        this.timeIntervalSelect.items = [];
        this.timeIntervalSelect.maxWidth = '130px';
    }

    private getFilterData() {
        this.requestService.getFilterData()
            .subscribe((filter: Filter) => {
                this.filter.checked = false;
                this.resultStatusSelect.items = this.renderResultStatus(filter.resultStatus);
                this.timeIntervalSelect.items = this.renderTimeInterval(filter.interval);
                this.initialTimeIntervalSelect = _.cloneDeep(this.timeIntervalSelect);
                this.initialResultStatusSelect = _.cloneDeep(this.resultStatusSelect);
            });

        this.ticketStatusSelect.items = this.renderTicketStatus();
        this.initialTicketStatusSelect = _.cloneDeep(this.ticketStatusSelect);
    }

    private renderTicketStatus() {
        const ticketsStatus = [
            { id: 2, value: "2", text: "Running", checked: true, enable: true, items: null },
            { id: 3, value: "3", text: "Calculated", checked: true, enable: true, items: null },
            { id: 5, value: "5", text: "Marked", checked: true, enable: true, items: null },
            { id: 4, value: "4", text: "No Ticket", checked: false, enable: true, items: null }];
        const tickets = new Array<ItemsSelect>();
        ticketsStatus.forEach((item) => {
            const temp = new ItemsSelect(
                item.id,
                item.value,
                item.text,
                item.checked,
                true,
                item.enable,
                []);

            tickets.push(temp);
        });

        return tickets;
    }

    private renderResultStatus(resultStatus: ItemSelect[]) {
        const results = new Array<ItemsSelect>();
        resultStatus.forEach((item) => {
            const temp = new ItemsSelect(
                item.id,
                item.value,
                item.text,
                item.checked,
                true,
                item.enable,
                []);

            results.push(temp);
        });

        return results;
    }

    private renderTimeInterval(interval: ItemSelect[]) {
        const intervalTime = new Array<ItemsSelect>();
        interval.forEach((item) => {
            const childItems = new Array<ItemsSelect>();
            item.items.forEach((child) => {
                const childTemp = new ItemsSelect(
                    Number(child.id),
                    child.value,
                    child.text,
                    child.checked,
                    true,
                    child.enable,
                    []);

                childItems.push(childTemp);
            });

            const temp = new ItemsSelect(
                Number(item.id),
                item.value,
                item.text,
                item.checked,
                true,
                item.enable,
                childItems);

            intervalTime.push(temp);
        });

        return intervalTime;
    }

    public changeTimeInterval(value: string) {
        const list = value.length > 0 ? value.split(',').map((x) => Number(x)) : [];
        this.intervalEvent.emit(new IntervalEvent(list, true));
    }

    public changeTicketStatus(value: string) {
        const list = value.length > 0 ? value.split(',') : [];
        this.ticketStatusEvent.emit(list);
    }

    public changeResultStatus(value: string) {
        const list = value.length > 0 ? value.split(',') : [];
        this.resultStatusEvent.emit(list);
    }

    private updateIntervalSelection() {
        const intervalSelection: number[] = [];
        this.timeIntervalSelect.items.forEach((item) => {
            let checked = true;
            item.items.forEach((subItem) => {
                if (!subItem.checked) {
                    subItem.checked = this.positions.indexOf(subItem.id) !== -1;
                }

                if (subItem.checked) {
                    intervalSelection.push(subItem.id);
                } else {
                    checked = false;
                }
            });

            item.checked = checked;
        });

        this.multipleSelectComponent.changeItems();
        this.intervalEvent.emit(new IntervalEvent(intervalSelection));
    }

    private updateIntervalSelectionByWaterBreak() {
        const intervals: number[] = [];
        this.timeIntervalSelect.items.forEach((item) => {
            item.items.forEach((subItem) => {
                if (subItem.checked) {
                    intervals.push(subItem.id);
                }
            });
        });

        this.intervalEvent.emit(new IntervalEvent(intervals));
    }

    private selectIntervalFilterByWaterBreak() {
        this.timeIntervalSelect.items.forEach((item) => {
            let checked = true;
            item.items.forEach((subItem) => {
                if (this.specialSessionPositions.indexOf(subItem.id) !== -1) {
                    subItem.checked = true;
                } else {
                    subItem.checked = false;
                }

                if (!subItem.checked) {
                    checked = false;
                }
            });

            item.checked = checked;
        });

        this.multipleSelectComponent.changeItems();
    }

    private selectTicketStatusFilterBySpecialSession() {
        const ticketStatusSelections = [];
        this.ticketStatusSelect.items.forEach((item) => {
            item.checked = true;
            ticketStatusSelections.push(item.id.toString());
        });
        this.ticketStatusSelect.isCheckAll = true;
        this.multipleSelectComponent.changeItems();
        this.ticketStatusSelect.selectionTitle = this.ticketStatusSelect.getItemsDisplay();

        this.ticketStatusEvent.emit(ticketStatusSelections);
    }
}