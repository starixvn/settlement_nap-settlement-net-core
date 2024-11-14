using Settlement.Setting.Requests;

namespace Settlement.Setting.Factories;

public class SettingSourceContext
{
    private readonly SettingSourceCriteriaStrategy _strategy;

    public SettingSourceContext(SettingSourceCriteriaStrategy strategy)
    {
        _strategy = strategy;
    }

    public INonQueryCommand CreateCriteria(UpdateAutoSettingsCommand command, UpdateResultSettingItem item)
    {
        return _strategy.CreateCriteria(command, item);
    }
}
