import { Injectable } from "@angular/core";
import { GetMoveTicketsRequest, MoveRunningTicketsRequest, ValidateMatchesRequest } from "../../models";
import { HttpRequestService } from "../../../shared/services";

@Injectable()
export class MoveRunningTicketsService {
    constructor(private readonly httpRequestService: HttpRequestService) { }

    public validateMatches(request: ValidateMatchesRequest) {
        return this.httpRequestService.postJson(request, `/api/moveticket/validate-matches`);
    }

    public getMoveTicketsMatches(request: GetMoveTicketsRequest) {
        return this.httpRequestService.postJson(request, `/api/moveticket/get-move-tickets-matches`);
    }

    public moveRunningTickets(request: MoveRunningTicketsRequest) {
        return this.httpRequestService.postJson(request, `/api/moveticket/move-running-tickets`);
    }
}