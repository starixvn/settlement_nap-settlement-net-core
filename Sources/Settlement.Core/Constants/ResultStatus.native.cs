namespace Settlement.Core.Constants;

public static class ResultStatus
{
    public const byte Initial = 0;

    public const byte Live = 1;

    public const byte Confirmed = 3;

    public const byte AutoSettled = 2;

    public const byte ManuallySettled = 5;
}