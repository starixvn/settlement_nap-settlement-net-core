import { Remark } from "../../shared/models";

export interface FantasyMatch {
    fantasyMatchDetail: FantasyMatchDetail;
    relatedMatches: FantasyRelatedMatch[];
}

export interface FantasyMatchDetail {
    fantasyHomeTeam: string;
    fantasyAwayTeam: string;
}

export interface FantasyRelatedMatch {
    matchId: number;
    matchCode: string;
    kickOffTime: string;
    homeName: string;
    homeId: number;
    awayId: number;
    awayName: string;
    homeValue: string;
    awayValue: string;
    remark: Remark;
    eventStatus: string;
    settlementStatus: boolean;
    betStatus: string;
    isDeleted: boolean;
    results: RelatedMatchResult[]
}

export type RelatedMatchResult = {
    resourceId: string
    homeValue: string
    awayValue:	 string
    resultStatusId: number	
    settlementStatusId: number
}