import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'timeConverter' })
export class TimeConverterPipe implements PipeTransform {
  transform(second: number): string {
    if (second === null || second === undefined || isNaN(second)) {
      return '0s';
    }

    const minutes = Math.floor(second / 60);
    const seconds = second % 60;

    if (minutes === 0) {
      return `${seconds}s`;
    } else if (seconds === 0) {
      return `${minutes}m`;
    } else {
      return `${minutes}m ${seconds}s`;
    }
  }
  
}
