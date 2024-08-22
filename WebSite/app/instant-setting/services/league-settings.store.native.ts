import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { AutoSettings } from "../../shared/models/league-settings.model";

@Injectable({
  providedIn: 'root'
})

export class LeagueSettingsStore{
  originalState: AutoSettings;
  state$: Observable<AutoSettings>;
  actionAfterUpdate: () => void;
  private readonly _state$: BehaviorSubject<AutoSettings>;

  protected constructor() {
    this._state$ = new BehaviorSubject(new AutoSettings());
    this.state$ = this._state$.asObservable();
  }
  get state(): AutoSettings {
    return this._state$.getValue();
  }
  setState(nextState: AutoSettings): void {
    this._state$.next(nextState);
    this.actionAfterUpdate()
  }
}

