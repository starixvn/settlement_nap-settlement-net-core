export enum FastMarketBetType {
    nextOneMinute = 221,
    nextFiveMinutes = 222,
    firstNextOneMinute = 223,
    firstNextFiveMinutes = 224,
    nextOneMinuteSetPiece = 225,
    combinationNextOneMinute = 226,
    combinationNextFiveMinutes = 227,
    timeMachineOverUnder = 228,
    timeMachineHDP = 229,
}

export const ControlType = {
    radio: [
        FastMarketBetType.firstNextOneMinute, FastMarketBetType.firstNextFiveMinutes,
        FastMarketBetType.nextOneMinuteSetPiece, FastMarketBetType.combinationNextOneMinute,
        FastMarketBetType.combinationNextFiveMinutes],
};