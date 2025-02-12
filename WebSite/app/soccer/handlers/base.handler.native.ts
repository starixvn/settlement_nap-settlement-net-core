import { Storage } from '../storage/storage.service.native';
export interface BaseHandler {
  setNextHandler(handler: BaseHandler): BaseHandler;
  handle(storage: Storage): void ;
}

export interface MatchDetailContext {
  matchDetail: any;
  storage: any;     
  verifyScoreGoalService: any; 
  confirmCopyScore(message: string): void;
}