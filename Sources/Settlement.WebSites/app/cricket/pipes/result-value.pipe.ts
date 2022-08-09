import * as _ from 'lodash';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'resultValuePipe' })
export class ResultValuePipe implements PipeTransform {
    public transform(resultValue: string, betType = '') {
        if(_.isEmpty(resultValue)) {
            return "-";
        } else {
            return this.getResult(resultValue, betType);
        }
    }

    private getResult(resultValue: string, betType = '') {
        const value = resultValue.toUpperCase();
        switch (value) {
            case "C":
                return "Caught";
            case "NC":
                return "Not Caught";
            case "B":
                return "Bowled";
            case "LBW":
                return "LBW";
            case "RO":
                return "Run Out";
            case "S":
                return "Stumped";
            case "OT":
                return "Others";
            case "Y":
                return "Yes";
            case "N":
                return this.noOrNone(betType);
            default:
                return resultValue;
        }
    }

    private noOrNone(betType: string) {
        if (_.isEqual(betType, '9662') || _.isEqual(betType, '9663')) {
            return 'None';
        }

        return 'No';
    }
}