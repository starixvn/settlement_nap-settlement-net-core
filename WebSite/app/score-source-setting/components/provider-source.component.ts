import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { ProviderSource, Game, UpdateProviderQuery, GetProviderQuery } from '../models';
import { MessageBoxService } from '../../shared/services';
import { ModalDialogMessage, Result } from '../../shared/models';
import { QueryService } from '../services';
import { Language } from '../../shared/language.native';
import * as _ from 'lodash';
import { DefaultGames } from '../constants/default-games';

@Component({
    selector: 'provider-source',
    templateUrl: './provider-source.component.html',
    standalone: true,
    imports: [CommonModule, FormsModule]
  })
export class ProviderSourceComponent implements OnInit {
  public readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
  public readonly games = DefaultGames;
  public selectedGame: Game;
  public providers: ProviderSource[];
  public errorMessage: string;
  public scoreSourcePermission: boolean;

  constructor(
    private readonly messageBoxService: MessageBoxService,
    private readonly queryService: QueryService
  ) { }

  ngOnInit(): void {
    this.selectedGame = this.games.find((game) => game.gameType === 1);
    this.getProviders();
    this.getPermission();
    this.confirmationDialogMessage.title = Language.Settings.ConfirmationTitle;
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.providers, event.previousIndex, event.currentIndex);
  }

  public getPermission() {
    this.queryService.getScoreSourcePermission().toPromise().then((scoreSource: boolean) => {
      this.scoreSourcePermission = scoreSource;
    });
  }

  public getProviders() {
    const query: GetProviderQuery = {
      gameType: this.selectedGame.gameType
    };

    this.queryService.getProviders(query).subscribe((providers: ProviderSource[]) => {
      if (providers.length > 0) {
        this.providers = providers;
      } else {
        this.providers = [];
      }
    });
  }

  public saveOrder() {
    if(!this.scoreSourcePermission){
      return;
    }
    this.confirmationDialogMessage.message = Language.Settings.SaveSettingMessage
                              .replace('SELECTED_GAME', this.selectedGame.name);
    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      this.setProviderOrder();
      const query: UpdateProviderQuery = {
        gameType: this.selectedGame.gameType,
        providers: this.providers
      };
      this.queryService.updateProvider(query).subscribe((result: Result) => {
        if (!result.isSuccessful) {
          this.errorMessage = result.errMsg;
        }
      });
    });
  }

  private setProviderOrder() {
    _.forEach(this.providers, (provider) => {
      provider.orderNo = this.providers.indexOf(provider) + 1;
    });
  }
}