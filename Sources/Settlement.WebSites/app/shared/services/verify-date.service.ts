import { Injectable } from '@angular/core';
import { NgbDateStruct, NgbDateParserFormatter } from "@ng-bootstrap/ng-bootstrap";

@Injectable()
export class VerifyDateService {
    private readonly ngbDateParserFormatter: NgbDateParserFormatter;

    constructor(ngbDateParserFormatter: NgbDateParserFormatter) {
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

    public convertToDateStruct(value: string) {
        const date = new Date(value);
        return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
    }
}