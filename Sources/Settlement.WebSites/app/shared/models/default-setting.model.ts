export class DefaultSetting {
    private static readonly threeValue = 3;
    public static get ALL_ITEMS_CHECKED_TEXT(): string { return 'All'; }
    public static get NONE_ITEM_CHECKED_TEXT(): string { return 'None Selected'; }
    public static get SUBFIX_NUMBER_ITEMS_CHECKED_TEXT(): string { return ' selected'; }
    public static get CHECK_ALL_CHECK_BOX_TEXT(): string { return 'Check All'; }
    public static get NO_ITEM_TEXT(): string { return 'No Data'; }
    public static get CHARACTER_VALUE(): string { return ','; }
    public static get CHARACTER_TEXT(): string { return ', '; }
    public static get NUMBER_ITEMS_DISPLAY(): number { return this.threeValue; }
    public static get MAX_HEIGHT(): string { return '350px'; }
    public static get MAX_WIDTH(): string { return '150px'; }
    public static get SHOW_HEADER(): boolean { return true; }
}