import { LogDetail } from './log-detail.model';
import { ResettleLogDetail } from './resettle-log-detail.model';
export class Match {
    sportType: number;
    leagueName: string;
    home: string;
    away: string;
    matchName: string;
    eventDate: string;
    collapsed: boolean;
    matchLogDetails: LogDetail[];
    resettleLogDetails: ResettleLogDetail[];
    playerNames: string[];
}