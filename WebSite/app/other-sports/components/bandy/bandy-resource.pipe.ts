import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "badyResourceName",standalone: true })
export class BandyResourceNamePipe implements PipeTransform {
  public transform(resourceId: string) {
   
      switch (resourceId) {
        case "01":
          return "First half";
        case "0001":
          return "Full Time";
        case "ET":
          return "ET";
        case "PEN":
          return "PEN";
        case "00":
          return "Match";
        default:
          return "";
      }
    }
}
