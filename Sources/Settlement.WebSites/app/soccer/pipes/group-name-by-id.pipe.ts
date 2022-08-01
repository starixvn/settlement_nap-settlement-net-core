import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'groupName' })
export class GroupNameByIdPipe implements PipeTransform {
    public transform(id: number) {
        switch (id) {
            case 6:
                return "Penalty Shootout - First 10";
            case 7:
                return "Extra Time - Next Goal Method";
            case 8:
                return "Penalty Shootout - Sudden Death";
            case 9:
                return "Goal";
            case 10:
                return "Corner";
            default:
                return `Penalty Shootout - Round ${id}`;
        }
    }
}
