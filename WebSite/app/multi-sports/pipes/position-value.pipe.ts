import { Pipe, PipeTransform } from '@angular/core';
import { ResourceIds } from '../../shared/constants';

@Pipe({
  name: 'positionValue',
  standalone: true
})
export class PositionValuePipe implements PipeTransform {
  private readonly positionMap = {
    [ResourceIds.extraInning]: "E.I",
    [ResourceIds.fullTime]: "FT"
  };

  transform(positionStr: string, otherInfo?: string): string {
    if (!positionStr) {
      return '';
    }

    let value = this.positionMap[positionStr] || 
                (positionStr.startsWith("010") ? parseInt(positionStr.slice(3)).toString() : positionStr);

    if (otherInfo) {
      return `${value}${otherInfo}`;
    }

    return value;
  }
} 