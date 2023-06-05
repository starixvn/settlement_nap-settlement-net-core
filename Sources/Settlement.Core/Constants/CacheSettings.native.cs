namespace Settlement.Core.Constants;

public static class CacheSettings
{
    public static class Keys
    {
        public const string WaitingListCacheKey = "Calculate";

        public const string WaitingAutoPayoutCacheKey = "Auto-Calculate";

        public const string WaitingBetBuilderCacheKey = "BetBuilder";

        public const string MemoryCacheManualPermission = "Settlement-Permission";

        public const string MemoryCacheMultiSportCacheKey = "MultiSport";

        public const string MemoryCacheBalanceUpDay = "BalanceUpDay";
    }

    public static class Expiration
    {
        public const int ShortCallRefreshTimerSeconds = 4;
        public const int LongCallRefreshTimerMinutes = 10;
        public const int BalanceUpTimerMinutes = 1;
    }
}