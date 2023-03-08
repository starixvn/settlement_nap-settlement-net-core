import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
    name: 'result',
    standalone: true
})
export class ResultPipe implements PipeTransform {
    public transform(result: string) {
        return _.isNil(result) || _.isEmpty(result.toString()) ? "-" : result;
    }
}