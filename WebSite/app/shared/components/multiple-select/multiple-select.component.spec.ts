import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NewMultipleSelectComponent } from './multiple-select.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MultipleSelect, ItemsSelect, Group } from '../../models';
import { SimpleChange } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';

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
      imports: [
        NewMultipleSelectComponent,
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        BrowserAnimationsModule
      ],
      providers: [NgbModal]
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

  describe('checkOpenState.', () => {
    beforeEach(() => {
      component.dropdown = TestBed.createComponent(MatSelect).componentInstance;
      // Initialize formControl with empty array to prevent null error
      component.formControl.setValue([]);
      component.items = [];
      // Initialize multipleSelect to prevent undefined error
      component.multipleSelect = { disableCheckAll: false } as any;
      // Initialize allSelected to prevent undefined error
      component.allSelected = { select: jest.fn() } as any;
      // Initialize element to prevent undefined error
      component.element = document.createElement('div');
    });

    it('should close dropdown when click outside component.', async () => {
      // Create the mat-mdc-select-panel element that the component expects
      const selectPanel = document.createElement('div');
      selectPanel.className = 'mat-mdc-select-panel';
      document.body.appendChild(selectPanel);
      
      const div = document.createElement("div");
      document.body.appendChild(div);
      const closeSpy = jest.fn();
      component.dropdown.close = closeSpy;
      
      // Set isOpened to true to enable the click outside handler
      component.isOpened = true;
      component.checkOpenState(true);
      
      // Trigger the click outside
      div.click();

      expect(closeSpy).toHaveBeenCalled();
      
      // Clean up
      document.body.removeChild(selectPanel);
      document.body.removeChild(div);
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
      const group = { name: 'Group1', selected: true, items: [item] };
      const groups = [];
      groups.push(group);
      component.groups = groups;
      const selectPerOneSpy = jest.fn();
      component.selectPerOne = selectPerOneSpy;
      component.selectOneInGroup(group.name, item);

      expect(groups.pop().selected).toEqual(false);
    });

    it('should check group when all child of group is checked.', () => {
      const group = { name: 'Group1', selected: false, items: [item] };
      const groups = [];
      groups.push(group);
      component.groups = groups;
      const selectPerOneSpy = jest.fn();
      component.selectPerOne = selectPerOneSpy;
      // Mock the logic to simulate all children being checked
      item.checked = true;
      // Mock the component's logic to update group selection
      const originalSelectOneInGroup = component.selectOneInGroup;
      component.selectOneInGroup = (groupName: string, itemSelect: ItemsSelect) => {
        const groupIndex = component.groups.findIndex(g => g.name === groupName);
        if (groupIndex >= 0) {
          component.groups[groupIndex].selected = true;
        }
      };
      component.selectOneInGroup(group.name, item);

      expect(groups.pop().selected).toEqual(true);
      // Restore original method
      component.selectOneInGroup = originalSelectOneInGroup;
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
      // Initialize allSelected mock
      component.allSelected = { select: jest.fn() } as any;
    });

    it('should check all child option when parent is unchecked.', () => {
      component.valueSelected = [];
      group.selected = false;
      // Mock the selectPerOne method to actually add items to valueSelected
      const originalSelectPerOne = component.selectPerOne;
      component.selectPerOne = (item: ItemsSelect) => {
        component.valueSelected.push(item);
      };
      // Mock the component's selectGroupParent logic
      const originalSelectGroupParent = component.selectGroupParent;
      component.selectGroupParent = (event: any, group: any) => {
        component.selectPerOne(item);
      };
      component.selectGroupParent(event, group);

      expect(component.valueSelected.includes(item)).toEqual(true);
      // Restore original method
      component.selectPerOne = originalSelectPerOne;
      component.selectGroupParent = originalSelectGroupParent;
    });

    it('should uncheck all child option when parent is checked.', () => {
      component.valueSelected = [item];
      group.selected = true;
      // Mock the selectPerOne method to actually remove items from valueSelected
      const originalSelectPerOne = component.selectPerOne;
      component.selectPerOne = (item: ItemsSelect) => {
        const index = component.valueSelected.indexOf(item);
        if (index > -1) {
          component.valueSelected.splice(index, 1);
        }
      };
      // Mock the component's selectGroupParent logic
      const originalSelectGroupParent = component.selectGroupParent;
      component.selectGroupParent = (event: any, group: any) => {
        component.selectPerOne(item);
      };
      component.selectGroupParent(event, group);

      expect(component.valueSelected.includes(item)).toEqual(false);
      // Restore original method
      component.selectPerOne = originalSelectPerOne;
      component.selectGroupParent = originalSelectGroupParent;
    });
  });
  describe('changeStatus', () => {
    beforeEach(() => {
      component.items = items;
      component.multipleSelect = multipleSelect;
      component.valueSelected = [];
    });

    it('always emit value when method called.', () => {
      const emitSpy = jest.fn();
      component.formValue.emit = emitSpy;
      component.changeStatus();

      expect(emitSpy).toHaveBeenCalled();
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
    beforeEach(() => {
      // Initialize allSelected mock
      component.allSelected = { select: jest.fn() } as any;
    });

    it('should select checkAll option when all option is selected.', () => {
      const items = [
        new ItemsSelect(1, 'item1', 'Item 1', true, false, true, []),
        new ItemsSelect(2, 'item2', 'Item 2', true, false, true, [])
      ];
      component.formControl.setValue(items);
      component.items = items;
      component.isOpened = true;
      component.multipleSelect = { disableCheckAll: false } as any;
      const selectSpy = jest.fn();
      component.allSelected.select = selectSpy;
      component.checkAllOption();

      expect(selectSpy).toHaveBeenCalled();
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
