import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Match } from './match.model';

export class Team extends Match {
    isDeadheat: boolean;
    disableDeadheat: boolean;
    selected: boolean;
    eventDate: string;
    dateTime: NgbDateStruct;
    oddsStatus: string;
    statusClass: string;
    totalCal: number;
    totalRunning: number;
    totalHide: number;
    originalStatus: string;
    originalScreenshot: string;
    screenShot: string;
    traderScore: string;
    originalTraderScore: string;
    resultStatusId: number;
    mismatchClass: string;
    traderConfirmClass: string;
    confirmedBy?: string;
    originalIsDeadheat: boolean;
}

export class TeamSettle {
    isDeadheat: boolean;
    eventDate: string;
    matchId: string;
    teamId: string;
    status: string;
    constructor(matchId: string, teamId: string, isDeadheat: boolean, status: string, eventDate: string) {
        this.matchId = matchId;
        this.teamId = teamId;
        this.isDeadheat = isDeadheat;
        this.status = status;
        this.eventDate = eventDate;

    }
}

