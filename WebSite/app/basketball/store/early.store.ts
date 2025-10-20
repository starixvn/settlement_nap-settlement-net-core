import { Injectable, signal } from "@angular/core";
import { MatchDetail, Permission } from "../../shared/models/sportsbook-sop";

@Injectable({
  providedIn: 'root'
})
export class EarlyStore {
   matchDetail = signal<MatchDetail>(null);
   permission = signal<Permission>(null);
   maxProviderCol = signal<number>(0);

   setState(matchDetail: MatchDetail, permission: Permission, maxProviderCol: number) {
    this.matchDetail.set(matchDetail);
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
