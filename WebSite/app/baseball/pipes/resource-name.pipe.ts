//new pipe

import { Pipe, PipeTransform } from '@angular/core';
import { ResourceIds } from '../../shared/constants';

@Pipe({
  name: 'resourceName',
  standalone: true,
})

export class ResourceNamePipe implements PipeTransform {
  transform(resourceId: string, isRefund = false, sessionTime = 0): string {

    const specialResource = [ResourceIds.fullTime, ResourceIds.extraInning, ResourceIds.totalHits];
    if (specialResource.includes(resourceId)) {
      return this.getSpecialSetName(resourceId, isRefund, sessionTime);
    }

    return this.getSetName(resourceId, isRefund, sessionTime);
  }

  private getSetName(resourceId: string,isRefund:boolean, sessionTime: number) {
    const lastTwoCharacters = resourceId.slice(-2);
    const position = parseInt(lastTwoCharacters);
    const name = sessionTime === 1 ? 'Game' : 'Inning';

    if (!isNaN(position)) {
      const suffix = this.getSuffix(position);
      return isRefund ? `${position}` : `${position}${suffix} ${name}`;
    }

    return '';
  }

  private getSpecialSetName(resourceId: string,isRefund:boolean,leagueType: number): string {
    if (resourceId === ResourceIds.fullTime) { 
      return leagueType === 1 ? 'Series' : 'Match'; // match normal
    }  
    
    if (resourceId === ResourceIds.extraInning) {
      return isRefund ? 'E.I' : 'Extra Inning';
    }
    
    if (resourceId == ResourceIds.totalHits) {
      return 'Total Hits';
    }

    return "";
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