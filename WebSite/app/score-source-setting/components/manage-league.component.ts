import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LeagueOutsideSource, UpdateLeagueSourceQuery, OutsideSource } from '../models';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { ModalDialogMessage, Result } from '../../shared/models';
import { Language } from '../../shared/language';
import { MessageBoxService, HttpRequestService, BlockUIService } from '../../shared/services';
import { QueryService } from '../services';
import * as _ from 'lodash';

@Component({
  selector: 'manage-league',
  templateUrl: './manage-league.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule, DragDropModule, MatDialogModule],
  providers: [MessageBoxService, QueryService, HttpRequestService, BlockUIService]
})

export class ManageLeagueComponent implements OnInit {

  public outsideSourceList: OutsideSource[];
  public outsideSourceSort: OutsideSource[];
  public outsideSourceSelected: OutsideSource;
  public screenShotSource: OutsideSource;
  public readonly warningDialogMessage: ModalDialogMessage = new ModalDialogMessage();

  constructor(private readonly dialogRef: MatDialogRef<ManageLeagueComponent>,
              private readonly messageBoxService: MessageBoxService,
              private readonly queryService: QueryService,
              @Inject(MAT_DIALOG_DATA) public data: LeagueOutsideSource) {
    this.dialogRef.disableClose = true;
  }

  public ngOnInit(): void {
    this.outsideSourceList = this.data.outsideSourceList;
    this.outsideSourceSort = this.data.outsideSourceSort;
    this.outsideSourceSelected = this.outsideSourceList[0];
    this.screenShotSource = this.outsideSourceSort.shift();
  }

  public close() {
    this.dialogRef.close();
  }

  public get activeAdd(): boolean | undefined {
    return !_.isEmpty(this.outsideSourceList) && this.outsideSourceSort.length < 3;
  }

  public drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.outsideSourceSort, event.previousIndex, event.currentIndex);
  }

  public addSource(item: OutsideSource) {
    if (this.outsideSourceSort.find((source) => source.pGid === item.pGid)) {
      this.warningDialogMessage.title = Language.InstantSetting.WarningTitle;
      this.warningDialogMessage.message = Language.LeagueOutsideSource.IsExistSource;
      this.messageBoxService.alert(this.warningDialogMessage);
      return;
    }

    this.outsideSourceSort.push(item);
  }

  public deleteSource(source: OutsideSource) {
    this.outsideSourceSort = _.filter(this.outsideSourceSort, item => item.pGid !== source.pGid);
  }

  public save() {
    this.warningDialogMessage.title = Language.confirmationBox;
    this.warningDialogMessage.message = Language.LeagueOutsideSource.confirm;
    this.messageBoxService.confirm(this.warningDialogMessage, () => {
      const query: UpdateLeagueSourceQuery = {
        leagueId: this.data.leagueId,
        Sources: this.sourceOrder()
      };
      this.queryService.updateLeagueSources(query).subscribe((result: Result) => {
        if (!result.isSuccessful) {
          this.warningDialogMessage.title = Language.InstantSetting.WarningTitle;
          this.warningDialogMessage.message = result.errMsg;
          this.messageBoxService.alert(this.warningDialogMessage);
        } else {
          this.dialogRef.close({ event: 'Save' });
        }
      });
    });
  }

  private sourceOrder() {
    const sources = _.concat(this.screenShotSource, this.outsideSourceSort);
    _.forEach(sources, (source) => {
      source.orderNo = sources.indexOf(source) + 1;
    });

    return sources;
  }
}
