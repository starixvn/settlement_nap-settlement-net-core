import { Match } from './match.model';
export interface Team extends Match {
    isDeadheat: boolean;
    selected: boolean;
}