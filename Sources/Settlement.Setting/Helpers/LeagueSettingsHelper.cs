using System.Text;
using Settlement.Setting.Criteria.LeagueSettings;
using System.Text;

namespace Settlement.Setting.Helpers;

public static class LeagueSettingsHelper
{
    public static string FindDifferentProperties(UpdateLeagueSettingsCriteria firstObject, UpdateLeagueSettingsCriteria secondObject)
    {
        var hasDifferentPropFlag = false;
        var propertyDict = new Dictionary<string, Func<UpdateLeagueSettingsCriteria, object>>
            {
                { "Retry time", obj => obj.RetryTime},
                { "AutoType", obj => obj.AutoType },
                { "Main: Has trader", obj => obj.Main_HasTrader },
                { "Main: Number Provider", obj => obj.Main_NumberProvider },
                { "Main: Primary provider", obj => obj.Main_PrimaryProvider },
                { "Main: Secondary Provider", obj => obj.Main_SecondaryProvider},
                { "Early: Has trader", obj => obj.EAR_HasTrader },
                { "Early: Number Provider", obj => obj.EAR_NumberProvider },
                { "Early: Primary Provider", obj => obj.EAR_PrimaryProvider },
                { "Early: Secondary Provider", obj => obj.EAR_SecondaryProvider },
            };

        var result = new StringBuilder($"Update auto payout setting on leagueId: {firstObject.LeagueId}.");

        foreach (var kvp in propertyDict)
        {
            var val1 = kvp.Value(firstObject);
            var val2 = kvp.Value(secondObject);

            if (!val1.Equals(val2))
            {
                result.Append($"<br/>{kvp.Key}: {val1} -> {val2}");
                hasDifferentPropFlag = true;
            }
        }

        return hasDifferentPropFlag ? result.ToString() : string.Empty;
    }
}