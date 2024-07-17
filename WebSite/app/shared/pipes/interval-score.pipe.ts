import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import { Score } from '../../shared/models';
@Pipe({
    name: 'intervalScore',
    standalone: true
})

export class IntervalScorePipe implements PipeTransform {
    public transform(score: Score[], teamName: string) {
        return _.isEqual(teamName, "Home")
        ? _.take(score, 2)
        : _.takeRight(score, 2);
    }
}