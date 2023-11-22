import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "badyResourceName",standalone: true })
export class BandyResourceNamePipe implements PipeTransform {
  public transform(resourceId: string, showFull = true) {
   
      switch (resourceId) {
        case "01":
          return showFull ? "First Half" : "HT";
        case "0001":
          return showFull ? "Full Time" : "FT";
        case "ET":
          return "ET";
        case "PEN":
          return "PEN";
        case "00":
          return "Final Score";
        default:
          return "";
      }
    }
}
