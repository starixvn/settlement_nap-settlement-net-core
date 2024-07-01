import * as _ from 'lodash';
import { Pipe, PipeTransform } from '@angular/core';
import { ResourcesIds } from '../constants';
@Pipe({
  name: 'resourceHeader',
  standalone: true
})
export class ResourceHeaderPipe implements PipeTransform {
  public transform(resourceId: string): string {
    if (_.isEqual(resourceId, ResourcesIds.totalGames)) {
      return "Total Games";
    } else if (_.isEqual(resourceId, ResourcesIds.totalSets)) {
      return "Total Sets";
    } else {
      const setNumber = resourceId.substring(1, 2);
      return `${setNumber}S`;
    }
  }
}