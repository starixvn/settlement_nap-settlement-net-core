import { MultipleSelect } from './../../models/multiple-select.model';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule } from '@angular/forms';
import { MaterialModule } from './../../material-module';
import {
  Component, Input, ViewChild, ViewChildren, Output, ViewEncapsulation,
  OnChanges, SimpleChanges, ChangeDetectorRef, QueryList, EventEmitter, ViewContainerRef, AfterViewInit, OnDestroy, ChangeDetectionStrategy
} from '@angular/core';
import { ItemsSelect, Group } from './../../models';
import { MatOption } from '@angular/material/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatSelect } from '@angular/material/select';
import * as _ from 'lodash';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'new-multiple-select',
  templateUrl: './multiple-select.component.html',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [MaterialModule, FormsModule, CommonModule, ScrollingModule],
  styles: [
    '.cdk-overlay-backdrop { display: none !important}'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewMultipleSelectComponent implements OnChanges {
  @Input() public multipleSelect: MultipleSelect;
  @Input() public disabled: boolean;
  @Output() public readonly formValue = new EventEmitter();
  dataChanged = new MultipleSelect();
  formControl = new FormControl();
  groups: Group[] = [];
  status = "";
  items: ItemsSelect[];
  valueSelected: ItemsSelect[] = [];
  element: Element;
  isOpened = false;
  searchText = "";
  itemAfterFilter: ItemsSelect[];
  searchTextEmpty = true;
  notExistItemIncludeSearchText = false;
  @ViewChild('allSelected') allSelected: MatOption;
  @ViewChild('dropdown') dropdown: MatSelect;
  @ViewChildren('panel') panel: QueryList<MatExpansionPanel>;

  constructor(viewContainerRef: ViewContainerRef) {
    this.element = viewContainerRef.element.nativeElement;
  }

  public ChangeDetectionCount = 0
  public get GetChangeDetectionCount() {

    return this.ChangeDetectionCount++
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.multipleSelect?.currentValue) {
      this.dataChanged = changes.multipleSelect.currentValue;
      this.items = this.dataChanged.items;
      this.itemAfterFilter = _.cloneDeep(this.items);
      this.createGroupType();
      this.initSelected();
    }

    if (changes.disabled) {
      this.dropdown.disabled = changes.disabled.currentValue;
    }
  }

  public selectPerOne(item: ItemsSelect) {
    if (this.allSelected.selected) {
      this.allSelected.deselect();
    }
    item.checked = !item.checked;
    this.valueSelected = this.formControl.value;
    this.changeStatus();
    this.checkAllOption();
  }

  public selectOneInGroup(groupName: string, itemSelect: ItemsSelect) {
    this.selectPerOne(itemSelect);
    const group = this.groups.find(item => item.name === groupName);
    if (group.selected) {
      group.selected = !group.selected;
    } else {
      const countChilds = this.valueSelected.filter(item => item.type === groupName).map(item => item);
      if (group.countChilds === countChilds.length) {
        group.selected = !group.selected;
      }
    }
  }

  public selectAllSelection() {
    if (this.allSelected.selected) {
      this.valueSelected = this.items;
      this.groups.forEach(item => item.selected = true);
    } else {
      this.valueSelected = [];
      this.groups.forEach(item => item.selected = false);
    }
    this.items.forEach(item => item.checked = this.allSelected.selected);
    this.changeStatus();
    this.checkAllOption();
  }

  public initSelected() {
    this.valueSelected = _.filter(this.items, item => item.checked);
    this.changeStatus();
  }

  public selectGroupParent($event, group: Group) {
    const allItemsInGroup = this.items.filter(item => item.type === group.name).map(item => item);
    if (group.selected) {
      allItemsInGroup.forEach(item => {
        item.checked = true;
        if (this.valueSelected.indexOf(item) < 0) {
          this.valueSelected.push(item);
        }
      });
    } else {
      this.valueSelected = this.valueSelected.filter(item => item.type !== group.name).map(item => item);
      allItemsInGroup.forEach(item => item.checked = false);
    }
    this.changeStatus();
    this.checkAllOption();
    $event.stopPropagation();
  }

  public checkOpenState(open: boolean) {
    this.isOpened = open;
    this.checkAllOption();
    if (this.isOpened) {
      document.addEventListener("click", this.handleClickOutside, false);
    } else {
      document.removeEventListener("click", this.handleClickOutside, false);
    }
  }

  private handleClickOutside = (event: MouseEvent) => {
    const ignoreClickOnMyElement = document.body.getElementsByClassName("mat-mdc-select-panel")[0];
    if (!this.isOpened || ignoreClickOnMyElement == null) {
      return;
    }

    const isClickOutSideElement = !ignoreClickOnMyElement.contains(event.target as Element)
      && !this.element.contains(event.target as Element);
    if (isClickOutSideElement) {
      this.searchText = "";
      this.search();
      this.changeStatus(false);
      this.dropdown.close();
    }
  }


  public changeStatus(emitValue = true) {
    this.formControl.setValue(this.valueSelected);
    if (emitValue) {
      this.formValue.emit(this.formControl.value);
    }

    if (!_.isEmpty(this.searchText)) {
      this.status = "";
      return;
    }
    if (this.items.length === 0) {
      this.status = this.multipleSelect.noData;
      return;
    }
    switch (this.formControl.value.length) {
      case this.items.length:
        this.status = this.multipleSelect.allItemsCheckedText;
        break;
      case 0:
        this.status = this.multipleSelect.noneItemCheckedText;
        break;
      case 1:
        this.status = this.formControl.value[0].text;
        break;
      default:
        this.status = `${this.formControl.value.length} selected`;
    }
  }

  public checkAllOption() {
    if (this.isOpened && this.formControl.value.length === this.items.length && !this.multipleSelect.disableCheckAll) {
      this.allSelected.select();
    }
  }

  public createGroupType() {
    this.groups = [];
    if (this.multipleSelect.haveGroup) {
      this.items.forEach(item => {
        const group = new Group(
          item.type,
          true
        );
        const index = this.groups.findIndex(i => i.name === item.type);
        if (index < 0) {
          group.selected = item.checked;
          this.groups.push(group);
        } else {
          this.groups[index].countChilds++;
          this.groups[index].selected = item.checked ? this.groups[index].selected : false;
        }
      });
    }
  }


  public hasSearchText() {
    return this.multipleSelect.enableSearchBox && !_.isEmpty(this.searchText);
  }

  public search() {
    if (!this.multipleSelect.enableSearchBox) {
      return;
    }
    this.multipleSelect.items.forEach(item => item.includeSearchText = this.includeSearchText(item));
    this.notExistItemIncludeSearchText = _.isUndefined(this.multipleSelect.items.find(item => item.includeSearchText));

    if (this.hasSearchText()) {
      this.status = "";
      this.searchTextEmpty = false;
    } else {
      this.changeStatus();
      this.checkAllOption();
      this.searchTextEmpty = true;
    }
  }

  private includeSearchText(item: ItemsSelect) {
    return this.hasSearchText() ? _.includes(item.text.toLowerCase(), this.searchText.toLowerCase()) : true;
  }

  public collapse(group: Group) {
    group.collapse = !group.collapse;
  }

  public openSearch() {
    return this.isOpened && this.multipleSelect.enableSearchBox;
  }
}
