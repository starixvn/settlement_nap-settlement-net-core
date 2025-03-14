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

            { (SportType.TableTennis,12), "0101" },
            { (SportType.TableTennis, 14), "0102" },
            { (SportType.TableTennis, 15), "0103" },
            { (SportType.TableTennis, 16), "0104" },
            { (SportType.TableTennis, 17), "0105" },
            { (SportType.TableTennis, 18), "0106" },
            { (SportType.TableTennis, 19), "0107" },
            { (SportType.TableTennis, 11), "01" },

            { (SportType.BeachVolleyball,11), "01" },
            { (SportType.BeachVolleyball, 12), "0101" },
            { (SportType.BeachVolleyball, 14), "0102" },
            { (SportType.BeachVolleyball, 15), "0103" },
        };

    public static Dictionary<(int, int), string> LeagueName => new()
        {
            { (SportType.VolleyBall,11), "Points Handicap" },
            { (SportType.VolleyBall, 12), "First Set Winner" },
            { (SportType.VolleyBall, 14), "Second Set Winner" },
            { (SportType.VolleyBall, 15), "Third Set Winner" },
            { (SportType.VolleyBall, 16), "Fourth Set Winner" },
            { (SportType.VolleyBall, 17), "Fifth Set Winner" },

            { (SportType.TableTennis,11), "Points Handicap" },
            { (SportType.TableTennis, 12), "1st Set" },
            { (SportType.TableTennis, 14), "2nd Set" },
            { (SportType.TableTennis, 15), "3rd Set" },
            { (SportType.TableTennis, 16), "4th Set" },
            { (SportType.TableTennis, 17), "5th Set" },
            { (SportType.TableTennis, 18), "6th Set" },
            { (SportType.TableTennis, 19), "7th Set" },

            { (SportType.BeachVolleyball,11), "Points Handicap" },
            { (SportType.BeachVolleyball, 12), "First Set Winner" },
            { (SportType.BeachVolleyball, 14), "Second Set Winner" },
            { (SportType.BeachVolleyball, 15), "Third Set Winner" },
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