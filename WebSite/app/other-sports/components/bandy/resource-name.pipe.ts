import { Pipe, PipeTransform } from "@angular/core";

@Pipe({name: 'resourceName'})
export class ReourceNamePipe implements PipeTransform {
  transform(reourceId: string): string {
    switch(reourceId) {
      case "01":
        return "HT";
      case "0001":
        return "FT";
      case "ET":
        return "ET";
      case "PEN":
        return "PEN";
      case "00":
        return "Match";
      default:
        return ""
    }
  }

}