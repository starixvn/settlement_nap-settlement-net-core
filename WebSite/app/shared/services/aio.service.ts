import { Injectable } from '@angular/core';
import { HttpRequestService } from './http-request.service.native';
import * as _ from 'lodash';
import { firstValueFrom } from 'rxjs';
import { GeneralResultDetail, MarkedTicketsModel, MatchResource, ModalDialogMessage, ResourceItem, Result, ResultSettingQuery } from '../models';
import { MessageBoxService } from './message-box.service.native';
import { Language } from '../language.native';
import { GeneralMatch, HedgeMatchDetail, ResultDetail, SaveScoreQuery } from '../models/sportsbook-sop';
import { ResultSettingType, ResultStatus, ResourceIds } from '../../shared/constants';
import { LeagueSettings } from '../models/league-settings.model';

@Injectable(
    {
        providedIn: 'root'
    }
)
export class AioService {
    private readonly aioApi = `/api/aio`;
    private readonly leagueSettingApi = '/api/league-settings'

    private readonly httpRequestService: HttpRequestService;
    public readonly warningDialogMessage: ModalDialogMessage = new ModalDialogMessage();
    constructor(httpRequestService: HttpRequestService,
        private readonly messageBoxService: MessageBoxService) {
        this.httpRequestService = httpRequestService;
    }

    public getLeagueSetting(leagueId: number, sportType: number) {
        const query = {
            leagueId,
            sportType
        }
        const request = this.httpRequestService.postJson<LeagueSettings>(query, `${this.leagueSettingApi}/get-settings`);
        return firstValueFrom(request);
    }

    public getMatch(query: object) {
        const request = this.httpRequestService.postJson<GeneralMatch>(query, `${this.aioApi}/get-match`);
        return firstValueFrom(request);
    }

    public push(query: object) {
        const request = this.httpRequestService.postJson<Result>(query, `${this.aioApi}/settle`);
        return firstValueFrom(request);
    }

    public verifyNoRunningOdds(query: object) {
        const request = this.httpRequestService.postJson<Result>(query, `${this.aioApi}/no-running-odds`, false);
        return firstValueFrom(request);
    }

    public changeResultSetting(query: object) {
        console.log(query);
        const request = this.httpRequestService.postJson<boolean>(query, `${this.aioApi}/result-setting`);
        return firstValueFrom(request);
    }

    public getLastestMatchResult(query: object) {
        const response = this.httpRequestService.postJson(query, `${this.aioApi}/get-recal-result`);
        return firstValueFrom(response);
    }

    public saveScore(query: SaveScoreQuery) {
        const request = this.httpRequestService.postJson<Result>(query, `${this.aioApi}/save-score`);
        return firstValueFrom(request);
    }

    public getLeagueSources(leagueId: number) {
        const query = {
            leagueId
        };

        return this.httpRequestService.postJson(query, `/api/setting/get-league-outside-source`, false);
    }

    public checkMarkedTickets(query: object) {
        const request = this.httpRequestService.postJson<MarkedTicketsModel>(query, `${this.aioApi}/check-marked-tickets`, false);
        return firstValueFrom(request);
    }

    public pushChildMatch(query: object) {
        const request = this.httpRequestService.postJson(query, `${this.aioApi}/settle-child-match`);
        return firstValueFrom(request);
    }

    public updateSettlementResultHistoryStatus(query: object) {
        const request = this.httpRequestService.postJson(query, `${this.aioApi}/update-settlement-result-history-status`);
        return firstValueFrom(request);
    }

    public async verifyChangedSettledTickets(resultDetails: GeneralResultDetail[], query: object) {
        const latestResults = await this.getLastestMatchResult(query) as GeneralResultDetail[];
        let needConfirm = false;
        _.forEach(resultDetails, (result) => {
            const correspondingResult = _.find(latestResults, (item) => _.isEqual(item.resourceId, result.resourceId));
            if (correspondingResult
                && (_.includes(correspondingResult.resultStatus, ResultStatus.refund)
                    || _.includes(correspondingResult.resultStatus, ResultStatus.completed)
                    && (!_.isEqual(result.homeValue, correspondingResult.homeValue)
                        || !_.isEqual(result.awayValue, correspondingResult.awayValue)))) {
                needConfirm = true;
            }
        });

        return needConfirm;
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
        const result = await this.verifyNoRunningOdds(params);
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

    public confirmResult(matchId: number, resourceIds: string,
        hedgeMatchDetail: HedgeMatchDetail, oldMatchDetail: HedgeMatchDetail = null) {
        this.changeConfirmResultSetting(Language.confirmRefund.confirmRefund, matchId, resourceIds, true,
            hedgeMatchDetail, oldMatchDetail);
    }

    public changeConfirmResultSDTSetting(matchId: number, resourceItems: ResourceItem[], isEnabled: boolean, hedgeMatchDetail: HedgeMatchDetail, is3x3 = false) {
        this.warningDialogMessage.title = Language.confirmationBox;
        this.warningDialogMessage.message = isEnabled ?
            Language.confirmRefund.sdtConfirm.replace('{0}', `${resourceItems[0].resourceName}: ${resourceItems[0].homeValue} - ${resourceItems[0].awayValue}`)
            : Language.confirmRefund.undoConfirmAll;
        const resourceIds = resourceItems.map(resource => resource.resourceId).join(',');
        this.messageBoxService.confirm(this.warningDialogMessage, () => {
            const query = new ResultSettingQuery(matchId, ResultSettingType.confirmRefundSDT,
                isEnabled, resourceIds, resourceItems);
            query.is3x3 = is3x3;
            this.changeResultSetting(query).then(async () => {
                await this.confirmHedgeMatch(query, hedgeMatchDetail);
            }).finally(this.messageBoxService.closePopupNotChanged);
        });
    }

    public changeConfirmResultSetting(message: string, matchId: number, resourceIds: string,
        isEnabled: boolean, hedgeMatchDetail: HedgeMatchDetail, oldMatchDetail: HedgeMatchDetail = null, confirmRefundResources: ResourceItem[] = []) {

        this.warningDialogMessage.title = Language.confirmationBox;
        this.warningDialogMessage.message = message;
        this.messageBoxService.confirm(this.warningDialogMessage, () => {
            const query = new ResultSettingQuery(matchId, ResultSettingType.confirmRefund,isEnabled, resourceIds);
            query.confirmRefundResources = confirmRefundResources;
         
            this.changeResultSetting(query).then(async () => {
                await this.confirmHedgeMatch(query, hedgeMatchDetail);
                await this.confirmOldMatch(query, oldMatchDetail);
            }).finally(() => this.messageBoxService.closePopupNotChanged());
        });
    }

    public generateDeterminedType(resultDetails: ResultDetail[]) {
        const roundBitStartAt = 3;
        const bitArray = new Array<number>(8).fill(0);
        const resultWithoutFinal = resultDetails
            .filter(resultDetail => ![ResourceIds.fullTime, ResourceIds.halfTime].includes(resultDetail.resourceId))
            .map(resultDetail => resultDetail.resourceId);

        resultDetails.forEach(resultDetail => {
            let bitPosition;
            switch (resultDetail.resourceId) {
                case ResourceIds.halfTime:
                    bitPosition = 0;
                    break;
                case ResourceIds.fullTime:
                    bitPosition = 2;
                    break;
                default:
                    bitPosition = resultWithoutFinal.indexOf(resultDetail.resourceId) + roundBitStartAt;
            };

            bitArray[bitPosition] = resultDetail.checked && !_.isEmpty(resultDetail.homeValue) && !_.isEmpty(resultDetail.awayValue) ? 1 : 0;
        });
        
        const reversedBitArray = bitArray.toReversed();
        return parseInt(reversedBitArray.join(''), 2);
    }

    private async confirmHedgeMatch(query: ResultSettingQuery, hedgeMatchDetail: HedgeMatchDetail) {
        if (!_.isNil(hedgeMatchDetail) && hedgeMatchDetail.matchId > 0) {
            query.matchId = hedgeMatchDetail.matchId;
            await this.changeResultSetting(query);
        }
    }

    private async confirmOldMatch(query: ResultSettingQuery, oldMatchDetail: HedgeMatchDetail) {
        if (!_.isNil(oldMatchDetail) && oldMatchDetail.matchId > 0) {
            query.matchId = oldMatchDetail.matchId;
            await this.changeResultSetting(query);
        }
    }

    private alertMessage(message: string) {
        this.warningDialogMessage.title = Language.CalculationWarning;
        this.warningDialogMessage.message = message;
        this.messageBoxService.alert(this.warningDialogMessage);
    }
}