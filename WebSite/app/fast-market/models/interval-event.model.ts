export class IntervalEvent {
    public list: number[];
    public emitFromSelection: boolean;

    constructor(list: number[], emitFromSelection = false) {
        this.list = list;
        this.emitFromSelection = emitFromSelection;
    }
}