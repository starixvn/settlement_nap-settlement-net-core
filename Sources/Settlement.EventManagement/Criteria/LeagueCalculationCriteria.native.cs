namespace Settlement.EventManagement.Criteria;

public class LeagueCalculationCriteria : CriteriaBase
{
    public DateTime FromDate { get; set; }

    public DateTime ToDate { get; set; }

    public int SportType => Settlement.Constants.SportType.Soccer;

    public override string GetSettingKey()
    {
        return "NAP_Set_LeagueSel";
    }

    public override bool IsValid()
    {
        return FromDate <= ToDate;
    }
}