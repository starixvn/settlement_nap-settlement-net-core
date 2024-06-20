using Settlement.Core.Constants;

namespace Settlement.Sportsbook.Aio.Constants;

public static class ChildMatchConstant
{
    public static Dictionary<(int, int), string> ResourceRelated => new()
        {
            { (SportType.VolleyBall,11), "01" },
            { (SportType.VolleyBall, 12), "0101" },
            { (SportType.VolleyBall, 14), "0102" },
            { (SportType.VolleyBall, 15), "0103" },
            { (SportType.VolleyBall, 16), "0104" },
            { (SportType.VolleyBall, 17), "0105" },

            { (SportType.TableTennis,11), "0101" },
            { (SportType.TableTennis, 12), "0102" },
            { (SportType.TableTennis, 14), "0103" },
            { (SportType.TableTennis, 15), "0104" },
            { (SportType.TableTennis, 16), "0105" },
            { (SportType.TableTennis, 17), "0106" },
            { (SportType.TableTennis, 18), "0107" },
            { (SportType.TableTennis, 19), "01" },
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