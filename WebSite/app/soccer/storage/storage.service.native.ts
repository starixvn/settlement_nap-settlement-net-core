import { GeneralResultDetail, ModalDialogMessage } from "../../shared/models";
import { ExternalResultDetail } from "../../shared/models/sportsbook-sop";
import { FantasyRelatedMatch, Match, UndoChecking } from "../components/calc/models/match.model";
import { ResultDetail } from "../../shared/models/sportsbook-sop/result-detail.model";
import { Match as RefundMatch } from "../components/refund/model/match.model";


export interface RefundBaseStorage {
  getMatch(): RefundMatch
  getSelectedResource(): GeneralResultDetail[]
  error(message: string)
  setConfirmMessage(message: string): void
  getIsDeterminedHedgeMatch(): boolean
}

export interface CalculateBaseStorage {
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
  getIsIgnoreCheckHt(): boolean
  setIsIgnoreCheckHt(value: boolean): void
  getExternalResultDetails(): ExternalResultDetail[]
  setIsReadyMatch(value: boolean): void
}