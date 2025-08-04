import { CalculateBaseStorage, RefundBaseStorage } from '../storage/storage.service.native';
export interface BaseHandler {
  setNextHandler(handler: BaseHandler): BaseHandler;
  handle(storage: CalculateBaseStorage | RefundBaseStorage): void ;
}

export interface MatchDetailContext {
  matchDetail: any;
  storage: any;     
  verifyScoreGoalService: any; 
  confirmCopyScore(message: string): void;
}