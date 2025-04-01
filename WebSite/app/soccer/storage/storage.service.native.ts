import { ModalDialogMessage } from "../../shared/models";
import { FantasyRelatedMatch, Match, UndoChecking } from "../components/calc/models/match.model";
import { ResultDetail } from "../models";

export interface Storage {
  getMatch(): Match
  getHalfTimeResult(): ResultDetail
  getFullTimeResult(): ResultDetail
  getRelatedMatches(): FantasyRelatedMatch[]
  getIsResettleTicket(): boolean
  setIsResettleTicket(value: boolean): void
  setConfirmMessage(message: string): void 
  getConfirmMessage():  ModalDialogMessage
  setCalculateAction(action: string): void
  getCalculateAction(): string
  isApplyHedgeMatch(): boolean
  getInstantScore(): UndoChecking
  setInstantScore(score: UndoChecking): void
  error(message: string)
  getOutsideHtResult(): ResultDetail;
  getIsIgnoreCheckFt(): boolean;
  setIsIgnoreCheckFt(value: boolean): void;
}