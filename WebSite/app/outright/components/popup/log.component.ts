import { Component, OnInit } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'log',
    templateUrl: './log.component.html'
})
export class LogComponent implements OnInit {

    public fromDate: NgbDateStruct;
    public toDate: NgbDateStruct;

    constructor() { }

    ngOnInit(): void {
    }

    public onSelectFromDate(value: NgbDateStruct) {
        if (value.day !== undefined) {
            this.fromDate = value;
        }
    }

    public onSelectToDate(value: NgbDateStruct) {
        if (value.day !== undefined) {
            this.toDate = value;
        }
    }
    

    public search() {}

}
