import * as _ from 'lodash';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'resourceName' })
export class ResourceNameByIdPipe implements PipeTransform {
    public transform(resourceId: string) {
        if (_.indexOf(resourceId, "Q") > - 1) {
            return resourceId.replace("Q", "Quarter ");
        } else if (_.isEqual(resourceId, "00")) {
            return "Full Time";
        } else if (_.isEqual(resourceId, "01")) {
            return "First Half";
        } else if (_.isEqual(resourceId, "OT")) {
            return "Over Time";
        }
        return resourceId;
    }
}