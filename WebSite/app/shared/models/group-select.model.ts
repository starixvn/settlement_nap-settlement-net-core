export class Group {
    public name: string;
    public selected: boolean;
    public countChilds: number;
    constructor(
        name: string,
        selected: boolean) {
        this.name = name;
        this.selected = selected;
        this.countChilds = 1;
    }
}