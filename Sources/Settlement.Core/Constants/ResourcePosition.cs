namespace Settlement.Core.Constants;

public static class ResourcePosition
{
    public static Dictionary<int, List<string>> ResourceBySport => new()
    {
        {SportType.BasketBall, new List<string> {"Q1", "Q2", ResourceType.Halftime, "Q3", "Q4", ResourceType.OverTime, ResourceType.Final}}
    };
}