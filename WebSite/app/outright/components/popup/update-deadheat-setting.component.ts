import { BlockUIService } from './../../../shared/services/block-ui.service';
import { MessageBoxService } from './../../../shared/services/message-box.service.native';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, Inject, Injector, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import * as _ from 'lodash';
import { OutrightService } from '../../services';
import { HttpRequestService } from '../../../shared/services';

@Component({
  selector: 'update-deadheat-setting',
  templateUrl: './update-deadheat-setting.component.html',
  standalone: true,
  imports: [CommonModule, DragDropModule, MatDialogModule],
  providers: [OutrightService, HttpRequestService, MessageBoxService, BlockUIService]
})
export class UpdateDeadheatSettingComponent implements OnInit {

  private dialogRef: MatDialogRef<UpdateDeadheatSettingComponent>;
  currentStatus: string;
  expectedStatus: string;
  confirmChange: boolean;

  no = "NO";
  yes = "YES";
  noSet = "NOT SET";
  currentSetting: boolean;
  expectedSetting: boolean;

  constructor(protected injector: Injector,
    @Inject(MAT_DIALOG_DATA) public data: { deadHeatSetting: number, leagueId: number }) {
    this.injector.get(MatDialog).closeAll();
    this.confirmChange = !_.isNull(this.data.deadHeatSetting);
    this.dialogRef = this.injector.get(MatDialogRef<UpdateDeadheatSettingComponent>);
    this.dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    if(!_.isNull(this.data.deadHeatSetting)){
      this.currentSetting = this.data.deadHeatSetting == 0
      this.currentStatus = this.currentSetting? this.no : this.yes; 
      this.expectedStatus = this.currentSetting ? this.yes : this.no; 
      this.expectedSetting = this.currentSetting ? true : false;
    }
  }

  close() {
    this.dialogRef.close();
  }

  openConfirm(allowDeadheat: boolean) {
    this.confirmChange = true;
    this.currentStatus = this.noSet; 
    if(allowDeadheat){
      this.expectedStatus = this.yes; 
      this.expectedSetting = true;
    } else {
      this.expectedStatus = this.no ; 
      this.expectedSetting = false;
    }
  }

  setSetting(){
    this.injector.get(OutrightService).updateDeatHeat(this.data.leagueId, this.expectedSetting).then(() => {
      this.dialogRef.close(this.expectedSetting);
    });
  }
}
