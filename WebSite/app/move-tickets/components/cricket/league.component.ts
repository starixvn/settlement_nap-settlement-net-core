import {
  MultiSport, MatchWaitingRequest, Permission,
  MoveTicketsRequest, GetChildMatchesRequest, ChildMatch
} from './../../models';
import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { ResultType, SportType, BackgroundColor } from '../../../shared/constants';
import * as _ from 'lodash';
import { MoveTicketsService } from './move-tickets.service';
import { MessageBoxService, SportMatchService } from './../../../shared/services';
import { Language } from '../../../shared/language.native';
import { ModalDialogMessage, Result, LeagueMatch, Match, Remark, SportMatch } from '../../../shared/models';
import { LeagueBaseComponent } from '../../../shared/components/sport-listing/league-base.component';

@Component({
  selector: 'league',
  templateUrl: './league.component.html'
})
export class LeagueComponent extends LeagueBaseComponent implements OnInit, OnChanges {
  @Input() public fromDate: string;
  @Input() public toDate: string;
  @Input() public multiSport: MultiSport;
  @Input() public request: MatchWaitingRequest;
  @Output() public readonly refreshAction = new EventEmitter();
  public sports: SportMatch[];
  public permission: Permission;
  public readonly dialogMessage: ModalDialogMessage = new ModalDialogMessage();
  public readonly cricketSportType = SportType.cricket;

  constructor(
    private readonly moveTicketsService: MoveTicketsService,
    private readonly messageBoxService: MessageBoxService,
    private readonly sportMatchService: SportMatchService,
    private readonly cd: ChangeDetectorRef) {
      super();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.multiSport.firstChange) {
      this.sports = this.sportMatchService.getSportsWithIntervalScore(this.multiSport.sports);
      this.permission = this.multiSport.permission;
    }
    this.cd.detectChanges();
  }

  public ngOnInit() {
    this.permission = this.multiSport.permission;
  }

  public get isExistedSport(): boolean | undefined {
    return this.sports && this.sports.length > 0;
  }

  public collapseSport(sport: SportMatch) {
    sport.collapse = !sport.collapse;
  }

  public collapseLeague(league: LeagueMatch) {
    league.collapse = !league.collapse;
  }

  public getEarlySettleBackground(match: Match) {
    const isRunning = !_.isNull(match.earlySettleStatus) && _.isEqual(match.earlySettleStatus.toLowerCase(), BackgroundColor.running)
      && _.isEqual(match.eventStatus.toLowerCase(), BackgroundColor.completed);
    const isCompleted = !_.isNull(match.earlySettleStatus) && _.isEqual(match.earlySettleStatus.toLowerCase(), BackgroundColor.completed);
    return isRunning ? BackgroundColor.autoSettleRunning : isCompleted ? BackgroundColor.calculated : '';
  }

  public canAutoSettlemt(sportType: number) {
    return _.includes(ResultType.autoSettleSupported, sportType);
  }

  public getLog(matchId: number) {
    this.moveTicketsService.popupLog(matchId, this.request.fromDate, this.request.toDate);
  }

  public moveTickets(match: Match) {
    this.dialogMessage.title = Language.confirmationBox;
    this.dialogMessage.message = Language.moveTickets.confirmMoveTickets;
    this.messageBoxService.confirm(this.dialogMessage, () => {
      const request = new MoveTicketsRequest(match.matchId);
      this.moveTicketsService.moveTickets(request).subscribe((result: Result) => {
        this.handleResult(result);
      });
    });
  }

  private handleResult(result: Result) {
    if (result.isSuccessful) {
      this.refreshAction.emit();
    } else {
      this.dialogMessage.title = Language.warningTitle;
      this.dialogMessage.message = result.errMsg;
      this.messageBoxService.alert(this.dialogMessage);
      this.refreshAction.emit();
    }
  }

  public getRemarkStatusTooltip(remark: Remark) {
    let tooltip = "";
    if (remark.isMtdHold) {
      tooltip += "MTD. Hold\n";
    }

    if (remark.isUndecided) {
      tooltip += "Undecided\n";
    }

    if (remark.isPending) {
      tooltip += "Result Pending\n";
    }

    if (remark.isUnderSettle) {
      tooltip += "Under Settlement\n";
    }

    if (remark.isKeyHold) {
      tooltip += "Hold Key\n";
    }

    return tooltip;
  }
}