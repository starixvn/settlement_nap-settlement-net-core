export class Group {
    public name: string;
    public selected: boolean;
    public countChilds: number;
    public collapse: boolean;
    constructor(
        name: string,
        selected: boolean) {
        this.name = name;
        this.selected = selected;
        this.countChilds = 1;
    }
}