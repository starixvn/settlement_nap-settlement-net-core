import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NewMultipleSelectComponent } from './multiple-select.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule, MatSelect } from '@angular/material/select';
import { MatExpansionModule, MatExpansionPanel } from '@angular/material/expansion';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatRippleModule, MatOption, MatOptionModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from "@angular/platform-browser";
import { MultipleSelect, ItemsSelect, Group } from '../../models';
import { SimpleChange, ChangeDetectorRef } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('MultipleSelectComponent', () => {
  let component: NewMultipleSelectComponent;
  let fixture: ComponentFixture<NewMultipleSelectComponent>;
  let groups: Group[] = [];
  let items: ItemsSelect[] = [];
  const event = new Event("mock event");
  const item = new ItemsSelect(1, "1", "1", null, null, null, []);
  const multipleSelect = new MultipleSelect();
  const group = new Group("mock group", false);
  multipleSelect.items = [];
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [NewMultipleSelectComponent],
      providers: [NgbModal],
      imports: [
        MatRippleModule,
        MatCheckboxModule,
        MatInputModule,
        MatSelectModule,
        MatExpansionModule,
        ScrollingModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewMultipleSelectComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should set items when component has changes.', () => {
      multipleSelect.haveGroup = false;
      component.multipleSelect = multipleSelect;
      component.ngOnChanges({ multipleSelect: new SimpleChange(null, multipleSelect, null) });
      fixture.detectChanges();

      expect(component.items).toEqual(multipleSelect.items);
    });

    it('should create groups when have group.', () => {
      item.type = "test";
      multipleSelect.items.push(item);
      multipleSelect.haveGroup = true;
      component.multipleSelect = multipleSelect;
      component.ngOnChanges({ multipleSelect: new SimpleChange(null, multipleSelect, null) });
      fixture.detectChanges();

      expect(component.groups.length).toBeGreaterThanOrEqual(1);
    });

    it('should check all when isCheckAll is true.', () => {
      multipleSelect.isCheckAll = true;
      item.checked = true ;
      multipleSelect.items.push(item);
      component.multipleSelect = multipleSelect;
      component.ngOnChanges({ multipleSelect: new SimpleChange(null, multipleSelect, null) });
      fixture.detectChanges();

      expect(component.valueSelected).toEqual(multipleSelect.items);
      expect(component.status).toEqual(multipleSelect.allItemsCheckedText);
    });

    it('should return right status when items is empty.', () => {
      multipleSelect.items = [];
      component.multipleSelect = multipleSelect;
      component.ngOnChanges({ multipleSelect: new SimpleChange(null, multipleSelect, null) });
      fixture.detectChanges();

      expect(component.status).toEqual(multipleSelect.noData);
    });
  });

  describe('clickOutside.', () => {

    beforeEach(() => {
      component.dropdown = TestBed.createComponent(MatSelect).componentInstance;
    });

    it('should close dropdown when click outside component.', async () => {
      const div = document.createElement("div");
      document.body.appendChild(div);
      spyOn(component.dropdown, "close");
      component.clickOutside();
      component.dropdown.open();
      div.click();

      expect(component.dropdown.panelOpen).toBe(false);
    });
  });

  describe('selectPerOne', () => {
    beforeEach(() => {
      component.allSelected = TestBed.createComponent(MatOption).componentInstance;
      items.push(item);
      component.items = items;
      component.formControl.setValue(items);
      component.multipleSelect = multipleSelect;
    });

    it('should uncheck checkAll when checkAll is checked.', () => {
      component.allSelected.select();
      item.checked = true;
      component.selectPerOne(item);

      expect(item.checked).toBeFalsy();
      expect(component.allSelected.selected).toBe(false);
    });

    it('should set valueSelected when called.', () => {
      item.checked = false;
      component.selectPerOne(item);

      expect(item.checked).toBeTruthy();
      expect(component.valueSelected).toEqual(items);
    });
  });

  describe('selectOneInGroup', () => {
    beforeEach(() => {
      groups = [];
    });

    it('should unchecked group when group is checked.', () => {
      group.selected = true;
      groups.push(group);
      component.groups = groups;
      spyOn(component, 'selectPerOne');
      component.selectOneInGroup(group.name, item);

      expect(groups.pop().selected).toEqual(false);
    });

    it('should check group when all child of group is checked.', () => {
      group.selected = false;
      item.type = group.name;
      component.valueSelected.push(item);
      groups.push(group);
      component.groups = groups;
      spyOn(component, 'selectPerOne');
      component.selectOneInGroup(group.name, item);

      expect(groups.pop().selected).toEqual(true);
    });
  });

  describe('selectGroupParent', () => {

    beforeEach(() => {
      groups = [];
      groups.push(group);
      item.type = group.name;
      items.push(item);
      component.items = items;
      component.multipleSelect = multipleSelect;
    });

    it('should check all child option when parent is unchecked.', () => {
      component.valueSelected = [];
      group.selected = false;
      component.selectGroupParent(event, group);

      expect(component.valueSelected.includes(item)).toEqual(true);
    });

    it('should uncheck all child option when parent is checked.', () => {
      component.valueSelected = items;
      group.selected = true;
      component.selectGroupParent(event, group);

      expect(component.valueSelected.includes(item)).toEqual(false);
    });
  });
  describe('changeStatus', () => {
    beforeEach(() => {
      component.items = items;
      component.multipleSelect = multipleSelect;
      component.valueSelected = [];
    });

    it('always emit value when method called.', () => {
      spyOn(component.formValue, 'emit');
      component.changeStatus();

      expect(component.formValue.emit).toHaveBeenCalled();
    });

    it('should return right status when items is empty.', () => {
      component.items = [];
      component.changeStatus();

      expect(component.status).toEqual(multipleSelect.noData);
    });

    it('should return right status when select all.', () => {
      component.valueSelected = items;
      component.changeStatus();

      expect(component.status).toEqual(multipleSelect.allItemsCheckedText);
    });

    it('should return right status when select only one option.', () => {
      component.valueSelected.push(item);
      component.changeStatus();

      expect(component.status).toEqual(item.text);
    });

    it('should return right status when none option checked.', () => {
      component.changeStatus();

      expect(component.status).toEqual(multipleSelect.noneItemCheckedText);
    });

    it('should return right status when normal selected.', () => {
      component.valueSelected.push(item);
      component.valueSelected.push(item);
      component.valueSelected.push(item);
      const expected = `${component.valueSelected.length} selected`;
      component.changeStatus();

      expect(component.status).toEqual(expected);
    });
  });

  describe('checkAllOption', () => {
    it('should select checkAll option when all option is selected.', () => {
      component.allSelected = TestBed.createComponent(MatOption).componentInstance;
      component.multipleSelect = multipleSelect;
      component.allSelected.deselect();
      component.formControl.setValue(items);
      component.items = items;
      const spy = spyOn(component.allSelected, 'select');
      component.checkAllOption();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('createGroupType', () => {
    beforeEach(() => {
      groups = [];
      component.items = [];
      items = [];
      item.type = group.name;
      items.push(item);
      component.items = items;
      component.multipleSelect = multipleSelect;
    });

    it('should create group list when flag haveGroup is true.', () => {
      const secondItem = new ItemsSelect(2, "2", "2", null, null, null, []);
      secondItem.type = "second group";
      items.push(secondItem);
      component.items = items;
      component.multipleSelect.haveGroup = true;

      component.createGroupType();

      expect(component.groups.length).toEqual(2);
    });

    it('should not duplicate group when group has more than one option.', () => {
      component.items.push(item);
      component.multipleSelect.haveGroup = true;
      component.createGroupType();

      expect(component.groups.length).toEqual(1);
    });

    it('should set right value countChild for group.', () => {
      component.items.push(item);
      component.multipleSelect.haveGroup = true;
      component.createGroupType();

      expect(component.groups.pop().countChilds).toEqual(2);
    });
  });

  describe('hasSearchText', () => {
    it('should return false when do not support search', () =>{
      multipleSelect.enableSearchBox = false;
      component.multipleSelect = multipleSelect;
      
      const actual = component.hasSearchText();

      expect(actual).toBeFalsy();
    });

    it('should return true when support search and has search text', () =>{
      multipleSelect.enableSearchBox = true;
      component.multipleSelect = multipleSelect;
      component.searchText = "1"
      
      const actual = component.hasSearchText();

      expect(actual).toBeTruthy();
    });
  });

  describe('search', () => {
    it('should set include Search Text when enable search and has search text', () => {
      multipleSelect.enableSearchBox = true;
      component.multipleSelect = multipleSelect;
      component.searchText = "text";
      const item = new ItemsSelect(1, "1", "Mock-text", null, null, null, []);
      const itemSecond = new ItemsSelect(2, "2", "Mock", null, null, null, []);
      items.push(item);
      items.push(itemSecond);
      component.multipleSelect.items = items;

      component.search();

      expect(item.includeSearchText).toBeTruthy();
      expect(itemSecond.includeSearchText).toBeFalsy();
      expect(component.notExistItemIncludeSearchText).toBeFalsy();
      expect(component.status).toEqual("");
      expect(component.searchTextEmpty).toBeFalsy();
    });
    it('should set include Search Text when enable search and not exist search text', () => {
      multipleSelect.enableSearchBox = true;
      component.multipleSelect = multipleSelect;
      component.searchText = "";
      const item = new ItemsSelect(1, "1", "Mock-text", null, null, null, []);
      const itemSecond = new ItemsSelect(2, "2", "Mock", null, null, null, []);
      items.push(item);
      items.push(itemSecond);
      component.multipleSelect.items = items;
      component.items = items;
      component.formControl.reset();

      component.search();

      expect(item.includeSearchText).toBeTruthy();
      expect(itemSecond.includeSearchText).toBeTruthy();
      expect(component.notExistItemIncludeSearchText).toBeFalsy();
      expect(component.status).toEqual(component.multipleSelect.noneItemCheckedText);
      expect(component.searchTextEmpty).toBeTruthy();
    });
  });
  it('collapse - Set Value collapse', ()=> {
    group.collapse = true;
    component.collapse(group);

    expect(group.collapse).toBeFalsy();
  });
});
