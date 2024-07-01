import * as _ from 'lodash';
import { Pipe, PipeTransform } from '@angular/core';
import { ResourcesIds } from '../constants';
@Pipe({
  name: 'externalHeader',
})
export class ExternalHeaderPipe implements PipeTransform {
  public transform(resourceId: string): string {
    if (_.isEqual(resourceId, ResourcesIds.totalGames)) {
      return "Games";
    } else if (_.isEqual(resourceId, ResourcesIds.totalSets)) {
      return "Sets";
    } else {
      const setNumber = resourceId.substring(1, 2);
      return `${setNumber}S`;
    }
  }
}