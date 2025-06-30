using Settlement.Setting.Constants;
using Settlement.Setting.Criteria;
using Settlement.Setting.Helpers;
using Settlement.Setting.Requests;

namespace Settlement.Setting.Factories;

public interface SettingSourceCriteriaStrategy
{
    AutoSettleRunUpdateCriteria CreateCriteria(UpdateAutoSettingsCommand command, UpdateResultSettingItem item);
}


public class LeagueSettingSourceCriteriaStrategy : SettingSourceCriteriaStrategy
{
    public AutoSettleRunUpdateCriteria CreateCriteria(UpdateAutoSettingsCommand command, UpdateResultSettingItem item)
    {
        var criteria = new UpdateLeagueAutoSettleSourceCriteria
        {
            AutoType = (byte)item.SettleType,
            LeagueId = command.LeagueId
        };

        if (item.SettleType is AutoSettleType.AutoRefund)
        {
            criteria.Main_WaitingTime = item.WaitingTime;
            return criteria;
        }

        if (item.SettleType == AutoSettleType.FastMarketAutoRefund)
        {

            criteria.Main_WaitingTime = item.WaitingTime;
            criteria.Enable = item.Enabled;
            criteria.IsApplyAll = item.IsApplyChildMatches;
            return criteria;
        }

        LeagueSettingsHelper.MapProviderDetails(item, criteria, item.ResourceType == ResourceType.Main);


        return criteria;
    }
}

public class MatchCriteriaStrategy : SettingSourceCriteriaStrategy
{
    public AutoSettleRunUpdateCriteria CreateCriteria(UpdateAutoSettingsCommand command, UpdateResultSettingItem item)
    {
        var criteria = new UpdateMatchAutoSettleSourceCriteria
        {
            AutoType = (byte)item.SettleType,
            MatchId = command.MatchId
        };

        if (item.SettleType == AutoSettleType.AutoRefund)
        {
            criteria.Main_WaitingTime = item.WaitingTime;
        }
        else if (item.SettleType == AutoSettleType.FastMarketAutoRefund)
        {

            criteria.Main_WaitingTime = item.WaitingTime;
            criteria.Enable = item.Enabled;
        }
        else
        {
            LeagueSettingsHelper.MapProviderDetails(item, criteria, item.ResourceType == ResourceType.Main);
        }

        return criteria;
    }
}