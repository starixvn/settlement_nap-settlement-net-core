import { Game } from "./game.model";

export class RequestNewOutsideSource {
    public sportType: number;
}

export class OutsideSource {
    public pGid: number;
    public sourceId: number;
    public sourceName: string;
    public remark: string;
    public sourceStatus: boolean;
    public orderNo: number;
    public games: Game[];
    public sportType: number;
    public sportName: string;
}