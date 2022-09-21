import { Selection } from './selection.model';

export class GroupSelection {
    public name: string;
    public collapsed: boolean;
    public checked: boolean;
    public selections: Selection[];

    constructor(name: string, selections: Selection[]) {
        this.name = name;
        this.collapsed = false;
        this.checked = false;
        this.selections = selections;
    }
}