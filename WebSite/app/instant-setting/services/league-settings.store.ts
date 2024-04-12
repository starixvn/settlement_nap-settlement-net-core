import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { LeagueSettings } from "../../shared/models/league-settings.model";

@Injectable({
  providedIn: 'root'
})

export class LeagueSettingsStore{
  originalState: LeagueSettings;
  state$: Observable<LeagueSettings>;
  actionAfterUpdate: () => void;
  private _state$: BehaviorSubject<LeagueSettings>;

  protected constructor() {
    this._state$ = new BehaviorSubject(new LeagueSettings());
    this.state$ = this._state$.asObservable();
  }
  get state(): LeagueSettings {
    return this._state$.getValue();
  }
  setState(nextState: LeagueSettings): void {
    this._state$.next(nextState);
    this.actionAfterUpdate()
  }
}

