import * as _ from 'lodash';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';

export class CustomNgbDateParserFormatter extends NgbDateParserFormatter {
    private readonly datePipe = new DatePipe('en-US');
    private readonly dateFormatString: string;
    constructor(dateFormatString: string) {
        super();
        this.dateFormatString = dateFormatString;
    }
    public format(date: NgbDateStruct): string {
        return date && !_.isNil(date.year) ?
            this.datePipe.transform(new Date(date.year, date.month - 1, date.day), this.dateFormatString) :
            '';
    }
    public parse(value: string): NgbDateStruct {
        let returnVal: NgbDateStruct;
        if (!value) {
            returnVal = null;
        } else {
            try {
                const dateParts = this.datePipe.transform(value, 'M-d-y').split('-');
                const year = parseInt(dateParts[2], 10);
                const month = parseInt(dateParts[0], 10);
                const day = parseInt(dateParts[1], 10);
                returnVal = {
                    year, month, day,
                };
            } catch (e) {
                returnVal = null;
            }
        }

        return returnVal;
    }
}