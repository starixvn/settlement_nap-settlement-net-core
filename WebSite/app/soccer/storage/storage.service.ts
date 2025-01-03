import { MatchDetailBase } from "../models";

export interface Storage {
  getMatchDetail(): MatchDetailBase;
  error(message: string)
}