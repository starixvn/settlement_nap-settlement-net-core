using Settlement.Setting.Constants;
using Settlement.Setting.Criteria;
using Settlement.Setting.Helpers;
using Settlement.Setting.Requests;

namespace Settlement.Setting.Factories;

public interface SettingSourceCriteriaStrategy
{
    INonQueryCommand CreateCriteria(UpdateAutoSettingsCommand command, UpdateResultSettingItem item);
}


public class LeagueSettingSourceCriteriaStrategy : SettingSourceCriteriaStrategy
{
    public INonQueryCommand CreateCriteria(UpdateAutoSettingsCommand command, UpdateResultSettingItem item)
    {
        var criteria = new UpdateLeagueAutoSettleSourceCriteria
        {
            AutoType = (byte)item.SettleType,
            LeagueId = command.LeagueId
        };

        if (item.SettleType == AutoSettleType.AutoRefund)
        {
            criteria.Main_WaitingTime = item.WaitingTime;
        }
        else
        {
            LeagueSettingsHelper.MapProviderDetails(item, criteria, item.ResourceType == ResourceType.Main);
        }

        return criteria;
    }


}

public class MatchCriteriaStrategy : SettingSourceCriteriaStrategy
{
    public INonQueryCommand CreateCriteria(UpdateAutoSettingsCommand command, UpdateResultSettingItem item)
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
        else
        {
            LeagueSettingsHelper.MapProviderDetails(item, criteria, item.ResourceType == ResourceType.Main);
        }

        return criteria;
    }
}