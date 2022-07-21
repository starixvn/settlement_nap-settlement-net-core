import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'sourceStatus' })
export class SourceStatusPipe implements PipeTransform {

    public transform(isActive: boolean) {
        return isActive ? 'Active' : 'Inactive';
    }
}