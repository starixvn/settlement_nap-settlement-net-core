import { Injectable, EventEmitter } from '@angular/core';

@Injectable(
    {
        providedIn: 'root'
    })
export class BlockUIService {
    public blockUIEvent: EventEmitter<boolean>;

    constructor() {
        this.blockUIEvent = new EventEmitter();
    }

    public startBlock(blockUI: boolean) {
        if (blockUI) {
            this.blockUIEvent.emit(true);
        }
    }

    public stopBlock() {
        this.blockUIEvent.emit(false);
    }
}