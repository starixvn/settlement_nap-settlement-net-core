using Settlement.Core.Criteria;

namespace Settlement.EventManagement.Criteria;

public class GetWaitingMultiSportCriteria : MultipleSiteCriteria
{
    public string MatchIds { get; set; }

    public override string GetSettingKey()
    {
        return $"NAP_Set_WaitingOtherSportSel_{DbServer}";
    }

    public override bool IsValid()
    {
        return !string.IsNullOrWhiteSpace(MatchIds);
    }
}