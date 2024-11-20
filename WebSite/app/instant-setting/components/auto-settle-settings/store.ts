import { BehaviorSubject } from "rxjs";
import { AutoSettleSettings, ResultSetting } from "./types";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class Store {
    private readonly autoSetting$ = new BehaviorSubject<AutoSettleSettings>(new AutoSettleSettings());
    public originResultSettings: ResultSetting[];
    actionAfterUpdate: () => void;

    public get autoSettings() {
        return this.autoSetting$.getValue();
    }

    public getAutoSettings() {
        return this.autoSetting$.asObservable();
    }

    public setAutoSetting(nextState: AutoSettleSettings) {
        this.autoSetting$.next(nextState);
        this.actionAfterUpdate();
    }

    public setResultSetting(nextState: ResultSetting) {
        const currentSetting = this.autoSetting$.getValue();

        const updatedResultSettings = currentSetting.resultSettings
            .map(x => x.resourceType === nextState.resourceType && x.settleType === nextState.settleType ? { ...x, ...nextState } : x);

        const updatedSetting = { ...currentSetting, resultSettings: updatedResultSettings };

        this.autoSetting$.next(updatedSetting);

        this.actionAfterUpdate();
    }
}