import { Injectable } from '@angular/core';
import { DatePipe } from "@angular/common";
import { NgbDateStruct, NgbDateParserFormatter } from "@ng-bootstrap/ng-bootstrap";

@Injectable()
export class VerifyDateService {
    private readonly ngbDateParserFormatter: NgbDateParserFormatter;

    constructor(ngbDateParserFormatter: NgbDateParserFormatter,
        private datePipe: DatePipe) {
        this.ngbDateParserFormatter = ngbDateParserFormatter;
    }

    public validDate(fromDate: NgbDateStruct, toDate: NgbDateStruct) {
        const from = new Date(this.dateFormat(fromDate));
        const to = new Date(this.dateFormat(toDate));
        return to >= from;
    }

    public dateFormat(date: NgbDateStruct) {
        return this.ngbDateParserFormatter.format(date);
    }
    
    public format(date: NgbDateStruct | null): string {
        const value =  this.ngbDateParserFormatter.format(date);
        return this.datePipe.transform(value,"yyyy-MM-dd")
    }

    public convertToDateStruct(value: string) {
        const date = new Date(value);
        return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
    }
}