export class MatchState {
  isChanged : boolean = false;
  undecidedColor: string;
  autoSettingBackgroundColor: string;
  resultHomeConfirmedBackgroundColor: string;
  resultAwayConfirmedBackgroundColor: string;

  constructor(){
    this.undecidedColor = '';
    this.autoSettingBackgroundColor= '';
    this.resultHomeConfirmedBackgroundColor = '';
    this.resultAwayConfirmedBackgroundColor = '';
  }
}