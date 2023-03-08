import { ScoreBySettlementPipe } from './../../shared/pipes/score-by-settlement.pipe';
import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { ModalDialogMessage } from '../../shared/models';
import { MessageBoxService } from '../../shared/services';
import { Match } from '../models';
import { MatchDetail, ResultDetail } from '../../shared/models/sportsbook-sop';
import { Language } from '../../shared/language.native';
import { ResourcesIds } from '../constants';
import { VerificationBaseService } from '../../core/services/verification-base.service';
import * as _ from 'lodash';
import { SettlementStatusId } from '../../shared/constants';

@Component({
    selector: 'match-detail',
    templateUrl: './match-detail.component.html',
    standalone: true,
    imports: [CommonModule, ScoreBySettlementPipe ],
})
export class MatchDetailComponent implements OnInit {
    @Input() public match: Match;
    @Input() public isEarlySettlement: boolean;

    public readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
    public matchDetail: MatchDetail;
    public resultDetails: ResultDetail[];
    public resourcesIds = ResourcesIds;
    public settlementStatus = SettlementStatusId;
    public lodash = _;

    constructor(
        private readonly verificationBaseService: VerificationBaseService,
        private readonly messageBoxService: MessageBoxService) {}

    public ngOnInit() {
        this.matchDetail = this.match.matchDetail;
        this.resultDetails = this.match.resultDetails.filter((map) => _.includes(map.resourceId, "M") || map.resourceId === "00");
        this.resultDetails.forEach(item => {
            item.isDisplayedForMember = this.match.permission.isLeader || Number(item.settlementStatusId) !== SettlementStatusId.Running;
          });
    }

    public refresh() {
        const scoreChanged = this.verificationBaseService.getChangedScores(this.match.resultDetails, this.match.originalResultDetail);
        if (scoreChanged.length > 0 && !this.match.matchDetail.isSavedScore) {
            this.confirmationDialogMessage.message = Language.reloadConfirmMessage;
            this.confirmationDialogMessage.title = Language.confirmationBox;
            this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
                this.reloadPage();
            });
        } else {
            this.reloadPage();
        }
    }

    reloadPage() {
        window.location.reload();
    }
}
