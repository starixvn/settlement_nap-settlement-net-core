using Settlement.Core.Constants;
using Settlement.Setting.Constants;
using Settlement.Setting.Criteria;
using Settlement.Setting.Criteria.LeagueSettings;
using Settlement.Setting.Requests;

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
                { "Early: Secondary Provider", obj => obj.EAR_SecondaryProvider }
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


    public static void MapProviderDetails(UpdateResultSettingItem resultSetting, SourceSettleCriteriaBase criteria, bool isMain)
    {
        if (isMain)
        {
            criteria.Main_WaitingTime = resultSetting.WaitingTime;
            criteria.Main_HasTrader = resultSetting.IsTraderRequired;
            criteria.Main_NumberProvider = resultSetting.MinProvider;
            criteria.Main_PrimaryProvider = resultSetting.PrimaryProvider;
            criteria.Main_TotalPrimaryProvider = resultSetting.TotalPrimaryProvider;
            criteria.Main_SecondaryProvider = resultSetting.SecondaryProvider;
            criteria.Main_TotalSecondaryProvider = resultSetting.TotalSecondaryProvider;
            criteria.Main_InactiveProvider = resultSetting.InactiveProvider;
        }
        else
        {
            criteria.EAR_WaitingTime = resultSetting.WaitingTime;
            criteria.EAR_HasTrader = resultSetting.IsTraderRequired;
            criteria.EAR_NumberProvider = resultSetting.MinProvider;
            criteria.EAR_PrimaryProvider = resultSetting.PrimaryProvider;
            criteria.EAR_TotalPrimaryProvider = resultSetting.TotalPrimaryProvider;
            criteria.EAR_SecondaryProvider = resultSetting.SecondaryProvider;
            criteria.EAR_TotalSecondaryProvider = resultSetting.TotalSecondaryProvider;
            criteria.EAR_InactiveProvider = resultSetting.InactiveProvider;
        }
    }


    public static string GetUpdateResultSettingItemDifferences(
        UpdateResultSettingItem first,
        UpdateResultSettingItem second,
        List<string> specificProperties)
    {
        var result = new StringBuilder();
        var type = typeof(UpdateResultSettingItem);

        foreach (var propertyName in specificProperties)
        {
            var property = type.GetProperty(propertyName, BindingFlags.Public | BindingFlags.Instance);
            if (property != null)
            {
                var value1 = property.GetValue(first);
                var value2 = property.GetValue(second);

                if (!Equals(value1, value2))
                {
                    result.Append($"<br/>{propertyName}: {value1} -> {value2}");
                }
            }
        }

        return result.ToString();
    }

    public static string AutoPayoutToText(AutoSettleType autoSettle)
    {
        return autoSettle switch
        {
            AutoSettleType.AutoPayoutSoccer => "AutoPayout",
            AutoSettleType.AutoDirect => "DirectPayout",
            AutoSettleType.AutoRefund => "AutoRefund",
            _ => string.Empty
        };
    }

    public static int GetActionLogId(string typeObject)
    {
        return (typeObject) switch
        {
            ("League") => ActionId.AutoPayoutSettingLeague,
            ("Match") => ActionId.AutoPayoutSettingMatch,
            _ => 0
        };
    }
}