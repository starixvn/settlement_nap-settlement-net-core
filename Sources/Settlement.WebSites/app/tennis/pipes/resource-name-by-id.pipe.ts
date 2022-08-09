import * as _ from 'lodash';
import { Pipe, PipeTransform } from '@angular/core';
import { ResourcesIds } from '../constants';

@Pipe({ name: 'resourceName' })
export class ResourceNameByIdPipe implements PipeTransform {
    public transform(resourceId: string) {
        if (_.isEqual(resourceId, ResourcesIds.totalSets)) {
            return "Match";
         } else if (_.isEqual(resourceId, ResourcesIds.totalGames)) {
            return "Total Games";
          } else {
            const setNumber = resourceId.substr(1, 1);
            return `Set ${setNumber}`;
          }
    }
}