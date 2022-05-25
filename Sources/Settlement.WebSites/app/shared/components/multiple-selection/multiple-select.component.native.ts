import { Component, ViewContainerRef, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { TreeViewComponent } from './tree-view.component';
import { ItemsSelect, MultipleSelect } from '../../models';

@Component({
    selector: 'multiple-select',
    templateUrl: './multiple-select.component.html',
    viewProviders: [TreeViewComponent],
})

// tslint:disable-next-line: component-class-suffix
export class MultipleSelectComponent implements OnInit {
    @Input() public multipleSelect: MultipleSelect;
    @Output() public loseFocus = new EventEmitter();
    public dropdownToggle: boolean;
    public expanded: boolean;
    public element: Element;
    public items: ItemsSelect[];

    constructor(viewContainerRef: ViewContainerRef) {
        this.element = viewContainerRef.element.nativeElement;
    }

    public ngOnInit() {
        this.expanded = true;
        this.getSelectedTitle();
        this.clickBody();
    }

    public getSelectedTitle() {
        this.multipleSelect.selectionTitle = this.multipleSelect.getItemsDisplay();
        this.multipleSelect.isCheckAll = this.multipleSelect.selectionTitle === this.multipleSelect.allItemsCheckedText;
    }

    public clickBody() {
        const body = document.querySelector('body');
        body.addEventListener('click', (e) => {
            if (!this.dropdownToggle || !e.target) {
                return;
            }

            if (this.element !== e.target && !this.element.contains(e.target as Element)) {
                this.dropdownToggle = false;
                this.loseFocus.emit(this.multipleSelect.getValueItems());
            }
        }, false);
    }

    public changeItems() {
        const rootItems = this.multipleSelect.items;
        let count = 0;
        let countChecked = 0;
        rootItems.forEach((item) => {
            item.checkFromChilds();
            count += item.countChilds;
            countChecked += item.countChildsChecked();
        });

        this.multipleSelect.isCheckAll = count === countChecked;
        this.multipleSelect.selectionTitle = this.multipleSelect.getItemsDisplay();
    }

    public toggle() {
        this.expanded = !this.expanded;
        this.multipleSelect.items.forEach((item) => {
            item.expanded = this.expanded;
            if (this.expanded) {
                item.expandedAllItems();
            }
        });
    }
}