import { LogDetail } from './log-detail.model';
export class Match {
    public leagueName: string;
    public matchName: string;
    public eventDate: string;
    public collapsed: boolean;
    public matchLogDetails: LogDetail[];
}