import { ProviderSource } from "./provider-source.model";

export class Game {
    public gameType: number;
    public name: string;
    public isActive: boolean;

    constructor(gameType: number, name: string) {
        this.gameType = gameType;
        this.name = name;
    }
}