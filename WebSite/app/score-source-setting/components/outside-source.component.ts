import { NewMultipleSelectComponent } from './../../shared/components/multiple-select/multiple-select.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SourceStatusPipe } from './../pipes/source-status.pipe';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MultipleSelect, ItemsSelect} from '../../shared/models';
import { OutsideSource, GetOutsideSourceQuery, Game, RequestNewOutsideSource } from '../models';
import { GenerateFilterService, QueryService } from '../services';
import { MatDialog } from '@angular/material/dialog';
import { AddSourceDialogComponent } from './add-source-dialog.component';
import { DefaultGames, DefaultFilterValue, sportSupport, Sport } from '../constants';
import { EditSourceDialogComponent } from './edit-source-dialog.component';
import * as _ from 'lodash';
import { SportType } from '../../shared/constants';
import { ExternalLinkPipe, GameStatusPipe } from '../pipes';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../shared/services';

@Component({
  selector: 'outside-source',
  templateUrl: './outside-source.component.html',
  standalone: true,
  imports: [CommonModule, SourceStatusPipe, FormsModule, GameStatusPipe, ExternalLinkPipe, NewMultipleSelectComponent, ReactiveFormsModule],
  providers: [QueryService, GenerateFilterService, HttpRequestService, BlockUIService, MessageBoxService]
})
export class OutsideSourceComponent implements OnInit {
  private readonly popupSize = '500px';
  private readonly popupEditSize = '520px';
  public gamesSelected: string;
  public statusSelected: string;
  public readonly games = DefaultGames;
  public readonly gameSelect = new MultipleSelect();
  public readonly statusSelect =  new MultipleSelect();
  public outsideSources: OutsideSource[];
  public sourceName: string;
  public sports: Sport[];
  public scoreSourcePermission: boolean;
  public sportSelected = SportType.eSports;
  constructor(private readonly generateFilterService: GenerateFilterService,
              private readonly queryService: QueryService,
              public dialog: MatDialog) { }

  async ngOnInit(): Promise<void> {
    this.gameSelect.items = this.generateFilterService.renderGames();
    this.gameSelect.isCheckAll = true;
    this.gamesSelected = this.gameSelect.items.map(item => Number(item.value)).join();
 
    this.statusSelect.items = this.generateFilterService.renderStatus();
    this.statusSelect.isCheckAll = true;
    this.statusSelected = DefaultFilterValue.allStatusChecked;
  
    this.scoreSourcePermission = await this.queryService.getScoreSourcePermission();
    
    this.sports = sportSupport.outsideSource;
  }

  public selectGame(value: ItemsSelect[]) {
    const maximumGameType = 5;
    this.gamesSelected = value.length === 0 || value.length === maximumGameType ? "" : value.map(item => Number(item.value)).join();
  }

  public selectStatus(value: ItemsSelect[]) {
    this.statusSelected = value.length < 2 && value.length > 0
      ? value.map(item => Number(item.value)).join() : DefaultFilterValue.allStatusChecked;
  }

  public filter() {
    const query: GetOutsideSourceQuery = {
      sourceName: this.sourceName,
      sourceStatus: this.statusSelected,
      gameTypes: this.gamesSelected,
      sportType: this.sportSelected
    };
    this.queryService.getSources(query).subscribe((outsideSources: OutsideSource[]) => {
      _.forEach(outsideSources, (outsideSource) => {
        outsideSource.games = this.generateGame(outsideSource.games);
      });

      this.outsideSources = outsideSources;
    });
  }

  public get disableGameType(): boolean {
    return !_.includes(sportSupport.gameTypes, this.sportSelected);
}

public sportChange() {
    this.gamesSelected = !_.includes(sportSupport.gameTypes, this.sportSelected) ? "" : this.gamesSelected;
}

  private generateGame(listGames: Game[]) {
    const newGames: Game[] = [];
    _.forEach(this.games, (item) => {
      const findGame = _.find(listGames, (game: Game) => game.gameType === item.gameType);
      if (!findGame) {
        newGames.push(new Game(item.gameType, item.name));
      } else {
        newGames.push(findGame);
      }
    });

    return newGames;
  }

  public openAddSourceDialog() {
    if(!this.scoreSourcePermission){
      return;
    }
    const request = new RequestNewOutsideSource();
    request.sportType = this.sportSelected;

    this.dialog.closeAll();
    this.dialog.open(AddSourceDialogComponent, {
      width: this.popupSize,
      height: this.popupSize,
      data: request,
    }).afterClosed().subscribe(result => {
      if (result && _.isEqual(result.event, 'Add')) {
        if (!this.outsideSources) {
          this.outsideSources = [];
        }

        this.outsideSources.push(result.newData as OutsideSource);
      }
    });
  }

  public openEditSourceDialog(source: OutsideSource) {
    if(!this.scoreSourcePermission){
      return;
    }
    this.dialog.closeAll();
    let height = this.popupEditSize;
    if(!_.includes(sportSupport.gameTypes, source.sportType)) {
      height = '300px';
    }
    this.dialog.open(EditSourceDialogComponent,
      {
      width: this.popupSize,
      height,
      data: source
    }).afterClosed().subscribe(result => {
      if (result && _.isEqual(result.event, 'Save')) {
        Object.assign(source, result.newData as OutsideSource);
      }
    });
  }
}