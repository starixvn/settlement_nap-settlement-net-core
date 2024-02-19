namespace Settlement.EventManagement.Criteria;
public class GetAutoStatusCriteria : CriteriaBase
{
    public string MatchIds { get; set; }


    public override string GetSettingKey() => "NAP_Set_AutoPayoutStatus_Sel";

    public override bool IsValid() => !string.IsNullOrEmpty(MatchIds);
}
