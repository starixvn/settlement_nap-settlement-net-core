import * as _ from 'lodash';
import { Pipe, PipeTransform } from '@angular/core';
import { ResourcesIds } from '../constants';

@Pipe({ name: 'resourceName' })
export class ResourceNameByIdPipe implements PipeTransform {
    public transform(resourceId: string) {
        if (_.isEqual(resourceId, ResourcesIds.totalSets)) {
            return "Total Sets";
         } else {
            const setNumber = resourceId.substr(3, 1);
            return `Set ${setNumber}`;
          }
    }
}