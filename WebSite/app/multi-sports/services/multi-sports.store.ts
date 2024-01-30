import { Injectable } from "@angular/core";
import { MatchWaitingRequest, MultiSport } from "../models";
import { Observable } from "rxjs/internal/Observable";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { ModalDialogMessage } from "../../shared/models";

@Injectable({
  providedIn: 'root'
})

export class MultiSportsStore{
  dialogMessage: ModalDialogMessage = new ModalDialogMessage();
  request: MatchWaitingRequest;
  enableRefresh: boolean = false;
  state$: Observable<MultiSport>;
  private _state$: BehaviorSubject<MultiSport>;

  protected constructor() {
    this._state$ = new BehaviorSubject(new MultiSport());
    this.state$ = this._state$.asObservable();
  }

  get state(): MultiSport {
    return this._state$.getValue();
  }
  setState(nextState: MultiSport): void {
    this._state$.next(nextState);
  }

}
