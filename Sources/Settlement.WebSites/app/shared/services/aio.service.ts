import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpRequestService } from './http-request.service.native';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { GeneralResultDetail, MatchResource, ModalDialogMessage, Result, ResultSettingQuery } from '../models';
import { MessageBoxService } from './message-box.service.native';
import { Language } from '../language';
import { HedgeMatchDetail, ResultDetail, SaveScoreQuery } from '../models/sportsbook-sop';
import { ResultSettingType, SettlementStatusId, TicketStatusText } from '../../shared/constants';
import { ClosePopupService } from '.';

@Injectable()
export class AioService {
    public apiUrl = '';
    private readonly httpRequestService: HttpRequestService;
    public readonly warningDialogMessage: ModalDialogMessage = new ModalDialogMessage();
    constructor(httpRequestService: HttpRequestService,
        private readonly messageBoxService: MessageBoxService,
        private readonly closePopupService: ClosePopupService) {
        this.httpRequestService = httpRequestService;
    }

    public getMatch(query: object) {
        const newApiUrl = _.isEmpty(this.apiUrl) ? `api/sportsbook-aio/get-match` : `${this.apiUrl}/api/aio/get-match`;
        return this.httpRequestService.postJson(query, newApiUrl);
    }

    public push(query: object) {
        const newApiUrl = _.isEmpty(this.apiUrl) ? 'api/sportsbook-aio/settle' : `${this.apiUrl}/api/aio/settle`;
        return this.httpRequestService.postJson(query, newApiUrl);
    }

    public verifyNoRunningOdds(query: object) {
        const newApiUrl = _.isEmpty(this.apiUrl) ? 'api/sportsbook-aio/no-running-odds' : `${this.apiUrl}/api/aio/no-running-odds`;
        return this.httpRequestService.postJson(query, newApiUrl, false);
    }

    public changeResultSetting(query: object): Observable<boolean> {
        const newApiUrl = _.isEmpty(this.apiUrl) ? 'api/sportsbook-aio/result-setting' : `${this.apiUrl}/api/aio/result-setting`;
        return this.httpRequestService.postJson(query, newApiUrl);
    }

    private getLastestMatchResult(query: object) {
        const newApiUrl = _.isEmpty(this.apiUrl) ? `api/sportsbook-aio/get-lastest-match-result` :
            `${this.apiUrl}/api/aio/get-recal-result`;
        return this.httpRequestService.postJson(query, newApiUrl);
    }

    public saveScore(query: SaveScoreQuery) {
        return this.httpRequestService.postJson(query, `${this.apiUrl}/api/aio/save-score`);
    }

    public getLeagueSources(leagueId: number) {
        const query = {
            leagueId
        };

        return this.httpRequestService.postJson(query, `${this.apiUrl}/api/setting/get-league-outside-source`, false);
    }

    public checkMarkedTickets(query: object) {
        return this.httpRequestService.postJson(query, `${this.apiUrl}/api/aio/check-marked-tickets`, false);
    }

    public pushChildMatch(query: object) {
        return this.httpRequestService.postJson(query, `${this.apiUrl}/api/aio/settle-child-match`);
    }

    public checkingStatus(query: object) {
        const url = `api/sportsbook-refund/checking-status`;
        return this.httpRequestService.postJson(query, url);
    }

    public verifyChangedSettledTickets(resultDetails: GeneralResultDetail[], query: object): Observable<boolean> {
        const calculated = "Complete";
        const refunded = "Refund";

        return this.getLastestMatchResult(query).pipe(map((lastestResults: GeneralResultDetail[]) => {
            let needConfirm = false;
            _.forEach(resultDetails, (result) => {
                const correspondingResult = _.find(lastestResults, (item) => _.isEqual(item.resourceId, result.resourceId));
                if (correspondingResult
                    && (_.includes(correspondingResult.resultStatus, refunded)
                        || _.includes(correspondingResult.resultStatus, calculated)
                        && (!_.isEqual(result.homeValue, correspondingResult.homeValue)
                            || !_.isEqual(result.awayValue, correspondingResult.awayValue)))) {
                    needConfirm = true;
                }
            });

            return needConfirm;
        }));
    }

    public async checkingNoRunningOdds(matchId: number, selectedResources: string[],
        actionType: string, relatedMatchResources = []) {
        const mainMatch = new MatchResource();
        mainMatch.matchId = matchId;
        mainMatch.resourceIds = selectedResources;
        const params = {
            matchId,
            action: actionType,
            selectedResources: [mainMatch].concat(relatedMatchResources)
        };
        const result = await this.verifyNoRunningOdds(params).toPromise() as Result;
        return result.errMsg;
    }

    public undoConfirmedResult(resultDetails: ResultDetail[], matchId: number, resourceIds: string,
        hedgeMatchDetail: HedgeMatchDetail, oldMatchDetail: HedgeMatchDetail = null) {
        const resultNotConfirmed = _.find(resultDetails, item => !item.resultSettingData.isConfirmedRefund);
        if (_.isNil(resultNotConfirmed)) {
            this.changeConfirmResultSetting(Language.confirmRefund.undoConfirm, matchId, resourceIds, false,
                hedgeMatchDetail, oldMatchDetail);
        } else {
            this.alertMessage(Language.confirmRefund.differentStates);
        }
    }

    public confirmResult(resultDetails: ResultDetail[], matchId: number, resourceIds: string,
        hedgeMatchDetail: HedgeMatchDetail, oldMatchDetail: HedgeMatchDetail = null) {
        const refundedResultHasNoRunningTicket = _.find(resultDetails, item =>
            item.settlementStatusId === SettlementStatusId.Refund && !_.isEqual(item.ticketStatus, TicketStatusText.running));
        if (_.isNil(refundedResultHasNoRunningTicket)) {
            this.changeConfirmResultSetting(Language.confirmRefund.confirmRefund, matchId, resourceIds, true,
                hedgeMatchDetail, oldMatchDetail);
        } else {
            this.alertMessage(Language.confirmRefund.refundedNoRunningTicket);
        }
    }

    public changeConfirmResultSetting(message: string, matchId: number, resourceIds: string,
        isEnabled: boolean, hedgeMatchDetail: HedgeMatchDetail, oldMatchDetail: HedgeMatchDetail = null) {
        this.warningDialogMessage.title = Language.ConfirmationBoxTitle;
        this.warningDialogMessage.message = message;
        this.messageBoxService.confirm(this.warningDialogMessage, async () => {
            const query = new ResultSettingQuery(matchId, ResultSettingType.confirmRefund,
                isEnabled, resourceIds);
            await this.changeResultSetting(query).toPromise().then(async () => {
                await this.confirmHedgeMatch(query, hedgeMatchDetail);
                await this.confirmOldMatch(query, oldMatchDetail);
                this.closePopupService.closePopupOnly();
            });
        });
    }

    private async confirmHedgeMatch(query: ResultSettingQuery, hedgeMatchDetail: HedgeMatchDetail) {
        if (!_.isNil(hedgeMatchDetail) && hedgeMatchDetail.matchId > 0) {
            query.matchID = hedgeMatchDetail.matchId;
            await this.changeResultSetting(query).toPromise();
        }
    }

    private async confirmOldMatch(query: ResultSettingQuery, oldMatchDetail: HedgeMatchDetail) {
        if (!_.isNil(oldMatchDetail) && oldMatchDetail.matchId > 0) {
            query.matchID = oldMatchDetail.matchId;
            await this.changeResultSetting(query).toPromise();
        }
    }

    private alertMessage(message: string) {
        this.warningDialogMessage.title = Language.CalculationWarning;
        this.warningDialogMessage.message = message;
        this.messageBoxService.alert(this.warningDialogMessage);
    }
}