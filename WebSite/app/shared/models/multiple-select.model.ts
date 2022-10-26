import { ItemsSelect } from "./items-select.model";
import { DefaultSetting } from './default-setting.model';

export class MultipleSelect {
    public selectionTitle: string;
    public isCheckAll = false;
    public maxHeight: string = DefaultSetting.MAX_HEIGHT;
    public maxWidth: string = DefaultSetting.MAX_WIDTH;
    public checkAllCheckBoxText: string = DefaultSetting.CHECK_ALL_CHECK_BOX_TEXT;
    public allItemsCheckedText: string = DefaultSetting.ALL_ITEMS_CHECKED_TEXT;
    public noneItemCheckedText: string = DefaultSetting.NONE_ITEM_CHECKED_TEXT;
    public subfixNumberItemsCheckedText: string = DefaultSetting.SUBFIX_NUMBER_ITEMS_CHECKED_TEXT;
    public numberItemsDisplay: number = DefaultSetting.NUMBER_ITEMS_DISPLAY;
    public noData: string = DefaultSetting.NO_ITEM_TEXT;
    public characterValue: string = DefaultSetting.CHARACTER_VALUE;
    public characterText: string = DefaultSetting.CHARACTER_TEXT;
    public showHeader: boolean = DefaultSetting.SHOW_HEADER;
    public items: ItemsSelect[] = [];
    public haveGroup: boolean;
    public disableCheckAll: boolean;
    public enableSearchBox: boolean;
    public disableSelectGroup: boolean;

    public getValueItems() {
        let value = '';
        this.items.forEach((item) => {
            const valueItem = item.getValueChildsChecked();
            if (valueItem !== '') {
                value = value === '' ?
                    valueItem : `${value},${valueItem}`;
            }
        });

        return value.toString().replace(/,/g, this.characterValue);
    }

    public getItemsDisplay() {
        const maxNumberItems = this.numberItemsDisplay !== undefined ?
            this.numberItemsDisplay : false;
        let text = '';
        let countChecked = 0;
        let count = 0;

        this.items.forEach((item) => {
            countChecked += item.countChildsChecked();
            count += item.countChilds;
            const textItems = item.getTextChildsChecked();
            if (textItems !== '') {
                text = text === '' ?
                    textItems : `${text},${textItems}`;
            }
        });

        text = text.replace(/,/g, this.characterText);
        return count === countChecked ? this.allItemsCheckedText :
            countChecked === 0 ? this.noneItemCheckedText :
                countChecked > maxNumberItems ? `${countChecked}${this.subfixNumberItemsCheckedText}` :
                    text;
    }

    public checkAllItems(isChecked: boolean) {
        this.items.forEach((item) => {
            item.checked = isChecked;
            item.checkChilds();
        });

        this.selectionTitle = this.getItemsDisplay();
    }
}