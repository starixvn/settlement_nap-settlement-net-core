namespace Settlement.Core.Constants;

public static class ResourceType
{
    public const string Halftime = "01";

    public const string Final = "00";

    public const string OverTime = "OT";
}

public static class Resources
{
    public static Dictionary<int, string[]> ResultHaftTime => new()
    {
        {SportType.BasketBall, new string[] { "Q1", "Q2"} }
    };

    public static Dictionary<int, string[]> ResultFullTime => new()
    {
        {SportType.BasketBall, new string[] { "Q2", "Q3", "OT"} }
    };
}