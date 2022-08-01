import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
@Pipe({ name: 'score' })
export class ScorePipe implements PipeTransform {
    public transform(score: number) {
        return _.isNil(score) ? '-' : score;
    }
}