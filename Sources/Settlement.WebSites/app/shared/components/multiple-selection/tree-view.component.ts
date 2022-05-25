import { Component, Input } from '@angular/core';
import { ItemsSelect } from '../../models';

@Component({
    selector: 'tree-view',
    templateUrl: './tree-view.component.html'
})

export class TreeViewComponent {
    @Input() public items: ItemsSelect[];
    public lastItem: ItemsSelect;
    public shiftKey: boolean;

    public keyDown() {
        this.shiftKey = true;
    }

    public keyUp() {
        this.shiftKey = false;
    }

    public clickEvent(item: ItemsSelect) {
        if (this.shiftKey) {
            this.handleWithShiftCheckbox(item);
        }

        this.lastItem = item;
    }

    public handleWithShiftCheckbox(item: ItemsSelect) {
        if (this.lastItem === undefined) {
            return;
        }

        this.checkListItem(item);
    }

    public checkListItem(currentItem: ItemsSelect) {
        let start = 0;
        let end = 0;
        let lastIndex = 0;
        let currentIndex = 0;
        for (let i = 0; i < this.items.length && (lastIndex === 0 || currentIndex === 0); i++) {
            if (this.items[i].id === this.lastItem.id) {
                lastIndex = i;
            }
            if (this.items[i].id === currentItem.id) {
                currentIndex = i;
            }
        }

        start = Math.min(lastIndex, currentIndex);
        end = Math.max(lastIndex, currentIndex);
        for (let i = start; i <= end; i++) {
            this.items[i].checked = currentItem.checked;
        }
    }
}