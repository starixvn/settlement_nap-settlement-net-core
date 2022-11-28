namespace Settlement.EventManagement.Criteria;

public class LeagueCriteria : CriteriaBase
{
    public DateTime FromDate { get; set; }

    public DateTime ToDate { get; set; }

    public string SportTypes { get; set; }

    public byte Page { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Set_SportLeagueSel";
    }

    public override bool IsValid()
    {
        return FromDate <= ToDate;
    }
}