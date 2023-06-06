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
    public noData: string = DefaultSetting.NO_ITEM_TEXT;
    public items: ItemsSelect[] = [];
    public haveGroup: boolean;
    public disableCheckAll: boolean;
    public enableSearchBox: boolean;
    public disableSelectGroup: boolean;
}