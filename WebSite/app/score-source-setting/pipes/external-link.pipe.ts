import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
    name: 'externalLink',
    standalone: true
})
export class ExternalLinkPipe implements PipeTransform {
    public transform(url: string) {
        return _.isEmpty(url) ? '' : url.includes('http') ? url : `http://${url}`;
    }
}