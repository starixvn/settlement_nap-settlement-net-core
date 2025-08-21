namespace Settlement.Core.Constants;

public static class CacheSettings
{
    public const string WaitingListCacheKey = "Calculate";

    public const string WaitingAutoPayoutCacheKey = "Auto-Calculate";

    public const string WaitingBetBuilderCacheKey = "BetBuilder";

    public const string MemoryCacheManualPermission = "Settlement-Permission";

    public const string MemoryCacheMultiSportCacheKey = "MultiSport";

    public const string MemoryCacheBalanceUpDay = "BalanceUpDay";

    public const string AutoMoveStatusKey = "Settlement-AutoMoveStatus";
}

public static class Expiration
{
    public const int ShortCallRefreshTimerSeconds = 3;
    public const int LongCallRefreshTimerMinutes = 10;
    public const int BalanceUpTimerMinutes = 1;
}