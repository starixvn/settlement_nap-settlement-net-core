export type Provider = {
    sourceId: number;
    sourceName: string;
    priority: number;
}

export type AutoSetting = {
    typeObject: "League" | "Match"
    typeSettle: "Payout" | "Refund"
    typeResult: "Main" | "Early",
    enabled: boolean,
    waitingTime: number,
    isTraderRequired:boolean
    minProvider: number,
    providers: Provider[],
}