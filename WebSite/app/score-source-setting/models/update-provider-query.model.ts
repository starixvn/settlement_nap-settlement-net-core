import { Game } from "./game.model";
import { ProviderSource } from "./provider-source.model";

export class UpdateProviderQuery {
    public gameType: number;
    public providers: ProviderSource[];
}