import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { LeagueSettings } from "../models/league-settings.model";

@Injectable({
  providedIn: 'root'
})

export class LeagueSettingsService {
  private static readonly leagueSettingsSubject: Subject<LeagueSettings> = new Subject();

  static get leagueSettings(): Observable<LeagueSettings> {
    return this.leagueSettingsSubject.asObservable();
  }

  static changeLeagueSettingsStatus(leagueSettings: LeagueSettings): void {
    this.leagueSettingsSubject.next(leagueSettings);
  }
}

