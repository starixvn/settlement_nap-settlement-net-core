using Settlement.Setting.Requests;

namespace Settlement.Setting.Factories;

public class SettingSourceContext(SettingSourceCriteriaStrategy strategy)
{
    public INonQueryCommand CreateCriteria(UpdateAutoSettingsCommand command, UpdateResultSettingItem item)
    {
        return strategy.CreateCriteria(command, item);
    }
}
