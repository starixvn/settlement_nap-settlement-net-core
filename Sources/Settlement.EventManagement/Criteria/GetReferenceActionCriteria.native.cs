namespace Settlement.EventManagement.Criteria;

public class GetReferenceActionCriteria : CriteriaBase
{
    public string MatchIds { get; set; }

    public string ActionIds { get; set; } = @"100,101,102,103,104,151,157,158,161,162,163,164,178,179,182,195,196,81040";

    public override string GetSettingKey()
    {
        return "NAP_Set_AutoPayout_ReferenceActionByMatchSel";
    }

    public override bool IsValid() => !string.IsNullOrWhiteSpace(MatchIds);
}