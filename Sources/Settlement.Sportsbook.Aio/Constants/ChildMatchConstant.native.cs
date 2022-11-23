namespace Settlement.Sportsbook.Aio.Constants;

public static class ChildMatchConstant
{
    public static Dictionary<int, string> ResourceRelated => new()
        {
            { 11, "01" },
            { 12, "0101" },
            { 14, "0102" },
            { 15, "0103" },
            { 16, "0104" },
            { 17, "0105" }
        };

    public static Dictionary<int, string> LeagueName => new()
        {
            { 11, "Points Handicap" },
            { 12, "First Set Winner" },
            { 14, "Second Set Winner" },
            { 15, "Third Set Winner" },
            { 16, "Fourth Set Winner" },
            { 17, "Fifth Set Winner" }
        };

    public static Dictionary<int, string> ChildMatchValid => new()
        {
            { 1, "" },
            { 2, "11, 12, 14" },
            { 3, "11, 12, 14, 15" },
            { 4, "11, 12, 14, 15, 16" },
            { 5, "11, 12, 14, 15, 16, 17" }
        };
}