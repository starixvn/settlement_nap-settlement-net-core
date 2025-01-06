import { ModalDialogMessage } from "../../shared/models";
import { FantasyRelatedMatch, Match } from "../components/calc/models/match.model";

export interface Storage {
  getMatch(): Match
  getRelatedMatches(): FantasyRelatedMatch[]
  getIsResettleTicket(): boolean
  setIsResettleTicket(value: boolean): void
  setConfirmMessage(message: string): void 
  getConfirmMessage():  ModalDialogMessage
  setCalculateAction(action: string): void
  getCalculateAction(): string
  isApplyHedgeMatch(): boolean
  error(message: string)
}