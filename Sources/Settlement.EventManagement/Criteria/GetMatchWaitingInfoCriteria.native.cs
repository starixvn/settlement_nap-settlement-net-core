namespace Settlement.EventManagement.Criteria;

public class GetMatchWaitingInfo : CriteriaBase
{
    public string MatchIds { get; set; }

    public override string GetSettingKey() => "NAP_Set_WaitingOtherSportSel_MatchInfo";

    public override bool IsValid() => MatchIds.Length > 0;
}