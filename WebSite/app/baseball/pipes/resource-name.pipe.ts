//new pipe

import { Pipe, PipeTransform } from '@angular/core';
import { ResourceIds } from '../../shared/constants';

@Pipe({
  name: 'resourceName',
  standalone: true,
})

export class ResourceNamePipe implements PipeTransform {
  transform(resourceId: string, isRefund = false): string {
    if (resourceId == ResourceIds.fullTime) {
      return 'Match';
    } else if (resourceId == ResourceIds.extraInning) {
      return isRefund ? 'E.I' : 'Extra Inning';
    }
    const lastTwoCharacters = resourceId.slice(-2);
    const position = parseInt(lastTwoCharacters);

    if (!isNaN(position)) {
      const suffix = this.getSuffix(position);
      return isRefund ? `${position}` : `${position}${suffix} Inning`;
    }

    return '';
  }

  private getSuffix(position: number): string {
    switch (position) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

}