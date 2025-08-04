import { BlockUIService } from './../../../shared/services/block-ui.service';
import { MessageBoxService } from './../../../shared/services/message-box.service.native';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, ViewChild, inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import * as _ from 'lodash';
import { OutrightService } from '../../services';
import { HttpRequestService } from '../../../shared/services';
import { DeadHeatOptions } from '../../constants/deadheat-setting';
import { FormsModule } from '@angular/forms';
import { StatusId } from '../../constants';
import { LeagueSettle } from '../../models';
import { ToastContainerDirective, ToastContainerModule, ToastrService } from 'ngx-toastr';
import { Language } from '../../../shared/language.native';
import { ModalDialogMessage } from '../../../shared/models';

@Component({
  selector: 'update-deadheat-setting',
  templateUrl: './update-deadheat-setting.component.html',
  standalone: true,
  imports: [CommonModule, DragDropModule, MatDialogModule, FormsModule,ToastContainerModule],
  providers: [OutrightService, HttpRequestService, MessageBoxService, BlockUIService]
})
export class UpdateDeadheatSettingComponent implements OnInit {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  private readonly toastrService = inject(ToastrService);
  private readonly messageBoxService = inject(MessageBoxService);
  private readonly matDialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<UpdateDeadheatSettingComponent>);
  private readonly blockUIService = inject(BlockUIService);
  outrightService = inject(OutrightService);
  expectedSetting: boolean | null;
  deadHeatOptions = DeadHeatOptions;
  leagueSettle: LeagueSettle;
  blockUI = true;
  readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: { deadHeatSetting: boolean, leagueId: number, sportType: number }) {
    
    this.confirmationDialogMessage.title = Language.confirmationBox;
    this.matDialog.closeAll();
    this.dialogRef.disableClose = true;
  }

   async ngOnInit() {
    this.blockUIService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
    this.expectedSetting = this.data.deadHeatSetting;
    this.toastrService.overlayContainer = this.toastContainer;
    this.leagueSettle = await this.outrightService.getMatches(this.data.leagueId, this.data.sportType, StatusId.runningAndCompleted);
  }

  close() {
    this.dialogRef.close();
  }

  updateSetting() {
    this.clearError();
    const teamWonQuantity = this.leagueSettle.teams.filter(team => team.status.toLowerCase() === 'won').length;
    if (teamWonQuantity > 1) {
      this.toastrService.error(Language.Outright.multiTeamWon);
      return;
    }
    this.confirmationDialogMessage.message = this.getMessage();
    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      this.sendRequest();
    });
  }

  private getMessage() {
    const expectStatus = this.deadHeatOptions.find(option => option.value === this.expectedSetting);
    const currentStatus = this.deadHeatOptions.find(option => option.value === this.data.deadHeatSetting);
    return Language.Outright.confirmDeadHeatSetting.replace('@CURRENT', currentStatus.name).replace('@EXPECTED', expectStatus.name);
  }

  private sendRequest() {
    this.outrightService.updateDeatHeat(this.data.leagueId, this.expectedSetting).then(() => {
      this.dialogRef.close(this.expectedSetting);
    });
  }


  clearError(){
    this.toastrService.clear();
  }
}
