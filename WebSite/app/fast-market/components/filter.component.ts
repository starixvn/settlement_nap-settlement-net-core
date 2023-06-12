import {
  Component,
  EventEmitter,
  Output,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
  SimpleChange,
} from "@angular/core";
import {
  DefaultSetting,
  ItemsSelect,
  MultipleSelect,
} from "../../shared/models";
import * as _ from "lodash";
import { Filter, IntervalEvent, ItemSelect } from "../models";
import { RequestService } from "../services/request.service";

@Component({
  selector: "filter",
  templateUrl: "./filter.component.html",
})
export class FilterComponent implements OnInit, OnChanges {
  public filter: Filter;
  public resultStatusSelect = new MultipleSelect();
  public timeIntervalSelect = new MultipleSelect();
  public ticketStatusSelect = new MultipleSelect();
  public initialTimeIntervalSelect: MultipleSelect;
  public initialResultStatusSelect: MultipleSelect;
  public initialTicketStatusSelect: MultipleSelect;

  @Input() public readonly checkedProceed: boolean;
  @Input() public positions: number[];
  @Input() public isApplySpecialSession: boolean;
  @Input() public specialSessionPositions: number[];
  @Input() public specialSessionType: string;
  @Output() public readonly onProceedEvent = new EventEmitter();
  @Output() public readonly intervalEvent = new EventEmitter();
  @Output() public readonly ticketStatusEvent = new EventEmitter();
  @Output() public readonly resultStatusEvent = new EventEmitter();

  private numberItemsDisplay: number = DefaultSetting.NUMBER_ITEMS_DISPLAY;
  private characterText: string = DefaultSetting.CHARACTER_TEXT;
  private subfixNumberItemsCheckedText: string =
    DefaultSetting.SUBFIX_NUMBER_ITEMS_CHECKED_TEXT;

  constructor(private readonly requestService: RequestService) {
    this.intervalEvent = new EventEmitter();
    this.ticketStatusEvent = new EventEmitter();
    this.resultStatusEvent = new EventEmitter();
  }

  public ngOnInit() {
    this.configFilter();
    this.getFilterData();
  }

  public ngOnChanges(changes: SimpleChanges) {
    const pos = "positions";
    const specialSession = "isApplySpecialSession";
    const specialSessionPos = "specialSessionPositions";
    if (
      (changes[specialSession] || changes[specialSessionPos]) &&
      this.isApplySpecialSession
    ) {
      this.selectIntervalFilterByWaterBreak();
      this.updateIntervalSelectionByWaterBreak();
      this.selectTicketStatusFilterBySpecialSession();
    }
    this.waterBreakUnchecked(changes[specialSession]);
    if (
      changes[specialSessionPos] &&
      !this.isApplySpecialSession &&
      !changes[specialSessionPos].firstChange
    ) {
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
      this.ticketStatusSelect.selectionTitle = this.getItemsDisplay(
        this.ticketStatusSelect
      );
      this.ticketStatusEvent.emit(["2", "3", "5"]);
      this.resultStatusSelect = _.cloneDeep(this.initialResultStatusSelect);
      this.resultStatusEvent.emit([]);
    }
  }

  private getItemsDisplay(ticketStatusSelect: MultipleSelect) {
    const maxNumberItems = this.numberItemsDisplay;
    let text = "";
    let countChecked = 0;
    let count = 0;

    ticketStatusSelect.items.forEach((item) => {
      countChecked += item.countChildsChecked();
      count += item.countChilds;
      const textItems = item.getTextChildsChecked();
      if (textItems !== "") {
        text = text === "" ? textItems : `${text},${textItems}`;
      }
    });

    text = text.replace(/,/g, this.characterText);
    return count === countChecked
      ? ticketStatusSelect.allItemsCheckedText
      : countChecked === 0
      ? ticketStatusSelect.noneItemCheckedText
      : countChecked > maxNumberItems
      ? `${countChecked}${this.subfixNumberItemsCheckedText}`
      : text;
  }

  public onChangeProceed(checked: boolean) {
    this.onProceedEvent.emit(checked);
  }

  private configFilter() {
    this.filter = new Filter();

    // this.ticketStatusSelect = new MultipleSelect();
    // this.ticketStatusSelect.items = [];
    // this.ticketStatusSelect.maxWidth = "150px";

    // this.resultStatusSelect = new MultipleSelect();
    // this.resultStatusSelect.maxWidth = "160px";
    // this.resultStatusSelect.items = [];

    // this.timeIntervalSelect = new MultipleSelect();
    // this.timeIntervalSelect.items = [];
    // this.timeIntervalSelect.maxWidth = "130px";
  }

  private async getFilterData() {
    const result = await this.requestService.getFilterData();
    this.filter.checked = false;

    this.resultStatusSelect = new MultipleSelect();
    this.resultStatusSelect.maxWidth = "160px";
    // this.resultStatusSelect.items = [];
    this.resultStatusSelect.items = this.renderResultStatus(
      result.resultStatus
    );
    this.initialResultStatusSelect = _.cloneDeep(this.resultStatusSelect);

    this.timeIntervalSelect = new MultipleSelect();
    this.timeIntervalSelect.maxWidth = "130px";
    this.timeIntervalSelect.haveGroup = true;
    this.timeIntervalSelect.items = this.renderTimeInterval(result.interval);
    this.initialTimeIntervalSelect = _.cloneDeep(this.timeIntervalSelect);

    this.ticketStatusSelect = new MultipleSelect();
    this.ticketStatusSelect.maxWidth = "150px";
    this.ticketStatusSelect.items = this.renderTicketStatus();
    this.ticketStatusSelect.selectionTitle = this.getItemsDisplay(
      this.ticketStatusSelect
    );
    this.initialTicketStatusSelect = _.cloneDeep(this.ticketStatusSelect);
  }

  private renderTicketStatus() {
    const ticketsStatus = [
      {
        id: 2,
        value: "2",
        text: "Running",
        checked: true,
        enable: true,
        items: null,
      },
      {
        id: 3,
        value: "3",
        text: "Calculated",
        checked: true,
        enable: true,
        items: null,
      },
      {
        id: 5,
        value: "5",
        text: "Marked",
        checked: true,
        enable: true,
        items: null,
      },
      {
        id: 4,
        value: "4",
        text: "No Ticket",
        checked: false,
        enable: true,
        items: null,
      },
    ];
    const tickets = new Array<ItemsSelect>();
    ticketsStatus.forEach((item) => {
      const temp = new ItemsSelect(
        item.id,
        item.value,
        item.text,
        item.checked,
        true,
        item.enable,
        []
      );

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
        []
      );

      results.push(temp);
    });

    return results;
  }

  private renderTimeInterval(interval: ItemSelect[]) {
    const childItems = new Array<ItemsSelect>();
    interval.forEach((item) => {
      item.items.forEach((child) => {
        const childTemp = new ItemsSelect(
          Number(child.id),
          child.value,
          child.text,
          child.checked,
          true,
          child.enable,
          []
        );

        childTemp.type = item.id.toString();
        childItems.push(childTemp);
      });
    });
    return childItems;
  }

  public changeTimeInterval(value: ItemSelect[]) {
    const list = value.length > 0 ? value.map((x) => Number(x.value)) : [];
    this.intervalEvent?.emit(new IntervalEvent(list, true));
  }

  public changeTicketStatus(value: ItemSelect[]) {
    const list = value.length > 0 ? value.map((x) => x.value) : [];
    this.ticketStatusEvent?.emit(list);
  }

  public changeResultStatus(value: ItemSelect[]) {
    const list = value.length > 0 ? value.map((x) => x.value) : [];
    this.resultStatusEvent?.emit(list);
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

    // this.timeIntervalSelect.selectionTitle = this.getItemsDisplay(
    //   this.timeIntervalSelect
    // );
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

    // this.timeIntervalSelect.selectionTitle = this.getItemsDisplay(
    //   this.timeIntervalSelect
    // );
  }

  private selectTicketStatusFilterBySpecialSession() {
    const ticketStatusSelections = [];
    this.ticketStatusSelect.items.forEach((item) => {
      item.checked = true;
      ticketStatusSelections.push(item.id.toString());
    });
    // this.ticketStatusSelect.isCheckAll = true;

    this.ticketStatusSelect.selectionTitle = this.getItemsDisplay(
      this.ticketStatusSelect
    );

    this.ticketStatusEvent.emit(ticketStatusSelections);
  }
}
