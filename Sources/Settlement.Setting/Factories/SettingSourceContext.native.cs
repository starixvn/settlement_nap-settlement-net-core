using Settlement.Setting.Criteria;
using Settlement.Setting.Requests;

namespace Settlement.Setting.Factories;

public class SettingSourceContext(SettingSourceCriteriaStrategy strategy)
{
    public AutoSettleRunUpdateCriteria CreateCriteria(UpdateAutoSettingsCommand command, UpdateResultSettingItem item)
    {
        return strategy.CreateCriteria(command, item);
    }
}
