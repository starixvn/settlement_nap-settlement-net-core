import { Injectable, signal } from "@angular/core";
import { MatchDetail, ResultDetail, Permission } from "../../shared/models/sportsbook-sop";

@Injectable({
  providedIn: 'root'
})
export class EarlyStore {
   matchDetail = signal<MatchDetail>(null);
   permission = signal<Permission>(null);
   maxProviderCol = signal<number>(0);
   resultDetails = signal<ResultDetail[]>([]);

   setState(matchDetail: MatchDetail, resultDetails: ResultDetail[], permission: Permission, maxProviderCol: number) {
    this.matchDetail.set(matchDetail);
    this.resultDetails.set(resultDetails);
    this.permission.set(permission);
    this.maxProviderCol.set(maxProviderCol);
   }


   getHomeTeam() {
    return this.matchDetail().homeName;
   }

   getAwayTeam() {
    return this.matchDetail().awayName;
   }
   
}
