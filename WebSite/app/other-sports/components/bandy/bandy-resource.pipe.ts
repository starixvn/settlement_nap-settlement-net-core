import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "badyResourceName",standalone: true })
export class BandyResourceNamePipe implements PipeTransform {
  public transform(resourceId: string, showFull = false) {
   
      switch (resourceId) {
        case "01":
          return showFull ? "First Half" : "FH";
        case "0001":
          return showFull ? "Full Time" : "FT";
        case "ET":
          return "ET";
        case "PEN":
          return "PEN";
        case "00":
          return showFull ? "Match" : "Final Score";
        default:
          return "";
      }
    }
}
