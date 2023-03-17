import { Pipe, PipeTransform } from '@angular/core';

@Pipe(
    {
        name: 'sourceStatus',
        standalone: true
    })
export class SourceStatusPipe implements PipeTransform {

    public transform(isActive: boolean) {
        return isActive ? 'Active' : 'Inactive';
    }
}