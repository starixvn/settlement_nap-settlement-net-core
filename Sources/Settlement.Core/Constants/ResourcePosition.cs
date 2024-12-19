namespace Settlement.Core.Constants;

public static class ResourcePosition
{
    public static Dictionary<int, List<string>> ResourceBySport => new()
    {
        {SportType.BasketBall, ["Q1", "Q2", ResourceType.Halftime, "Q3", "Q4", ResourceType.OverTime, ResourceType.Final]},
        {SportType.BaseBall, ["0101", "0102", "0103", "0104", "0105", "0106", "0107", "0108", "0109", "EI"]}
    };
}