import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
    name: 'externalSourceName',
    standalone: true
})
export class ExternalSourceNamePipe implements PipeTransform {
    public transform(sourceName: string) {
        return _.isEmpty(sourceName) ? '-' : sourceName;
    }
}