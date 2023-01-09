import { Injectable } from "@angular/core";
import { HttpRequestService } from "../../shared/services";

@Injectable()
export class OutrightService {
    private outrightApi = "";
    private settingApi = "";

    constructor(private httpRequestService: HttpRequestService) {}

    public getSport() {
        return []
    }

    public getLeagues() {
        return []
    }

    // public getStatus() {
    //     return []
    // }

    public getLeagueMatches() {
        
    }
}