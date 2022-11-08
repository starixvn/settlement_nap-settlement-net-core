import {
  Component, Input, ViewChild, ViewChildren, Output, ViewEncapsulation,
  OnChanges, SimpleChanges, ChangeDetectorRef, QueryList, EventEmitter, ViewContainerRef, AfterViewInit
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ItemsSelect, Group, MultipleSelect } from './../../models';
import { MatOption } from '@angular/material/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatSelect } from '@angular/material/select';
import * as _ from 'lodash';

@Component({
  selector: 'new-multiple-select',
  templateUrl: './multiple-select.component.html',
  encapsulation: ViewEncapsulation.None
})
export class NewMultipleSelectComponent implements OnChanges, AfterViewInit {
  @Input() public multipleSelect: MultipleSelect;
  @Input() public disabled: boolean;
  @Output() public readonly formValue = new EventEmitter();
  dataChanged = new MultipleSelect();
  formControl = new FormControl();
  groups: Group[] = [];
  status = "";
  items: ItemsSelect[];
  valueSelected: ItemsSelect[] = [];
  onlyCallWithSecondTime = 0;
  element: Element;
  isOpened = false;
  searchText = "";
  itemAfterFilter: ItemsSelect[];
  searchTextEmpty = true;
  notExistItemIncludeSearchText = false;
  @ViewChild('allSelected') allSelected: MatOption;
  @ViewChild('dropdown') dropdown: MatSelect;
  @ViewChildren('panel') panel: QueryList<MatExpansionPanel>;

  constructor(private readonly cd: ChangeDetectorRef,
    viewContainerRef: ViewContainerRef) {
    this.element = viewContainerRef.element.nativeElement;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.multipleSelect) {
      this.dataChanged = changes.multipleSelect.currentValue;
      this.items = this.dataChanged.items;
      this.itemAfterFilter = _.cloneDeep(this.items);
      this.onlyCallWithSecondTime = 0;
      this.createGroupType();
      this.initSelected();
      this.cd.detectChanges();
    }

    if (changes.disabled) {
      this.dropdown.disabled = changes.disabled.currentValue;
    }
  }

  ngAfterViewInit() {
    this.clickOutside();
  }

  public clickOutside() {
    document.body.addEventListener('click', (event) => {
      const ignoreClickOnMyElement = document.getElementsByClassName("cdk-overlay-pane")[0];
      if (!this.isOpened || ignoreClickOnMyElement == null) {
        return;
      }

      const isClickOutSideElement = !ignoreClickOnMyElement.contains(event.target as Element)
        && !this.element.contains(event.target as Element);
      if (isClickOutSideElement) {
        this.searchText = "";
        this.search();
        this.changeStatus();
        this.dropdown.close();
      }
    }, false);
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
    if (!group.selected) {
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
    if (this.onlyCallWithSecondTime < 3 && this.onlyCallWithSecondTime > 0) {
      if (!open) {
        this.panel.forEach(item => {
          item.expanded = false;
        });
      } else {
        this.panel.forEach(item => {
          item.expanded = true;
        });
      }
    }
    this.isOpened = open;
    this.checkAllOption();
    this.onlyCallWithSecondTime++;
  }

  public changeStatus() {
    this.formControl.setValue(this.valueSelected);
    this.formValue.emit(this.formControl.value);

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
    if (this.formControl.value.length === this.items.length && !this.multipleSelect.disableCheckAll) {
      this.allSelected.select();
      this.cd.detectChanges();
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

  public scrollTop() {
    const top = document.getElementsByName('top');
    if (top !== null) {
      _.forEach(top, item => item.scrollIntoView());
    }
  }

  public hasSearchText() {
    return this.multipleSelect.enableSearchBox && !_.isEmpty(this.searchText);
  }

  public search() {
    if (this.hasSearchText()) {
      this.status = "";
      this.searchTextEmpty = false;
    } else {
      this.changeStatus();
      this.searchTextEmpty = true;
    }
    this.multipleSelect.items.forEach(item => item.includeSearchText = this.includeSearchText(item));
    this.notExistItemIncludeSearchText = _.isUndefined(this.multipleSelect.items.find(item => item.includeSearchText));
  }

  private includeSearchText(item: ItemsSelect) {
    return this.hasSearchText() ? _.includes(item.text.toLowerCase(), this.searchText.toLowerCase()) : true;
  }

  public collapse(group: Group){
    group.collapse = !group.collapse;
  }
}
