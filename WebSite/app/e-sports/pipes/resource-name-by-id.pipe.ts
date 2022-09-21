import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'resourceName' })
export class ResourceNameByIdPipe implements PipeTransform {
    public transform(resourceId: string) {
        return resourceId.replace("M", "Map ").replace("00", "Full Time");
    }
}