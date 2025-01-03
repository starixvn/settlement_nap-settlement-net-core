namespace Settlement.EventManagement.Criteria;

using CoreConstants = Settlement.Core.Constants;

public class LeagueCalculationCriteria : CriteriaBase
{
    public DateTime FromDate { get; set; }

    public DateTime ToDate { get; set; }

    public int SportType => CoreConstants.SportType.Soccer;

    public override string GetSettingKey()
    {
        return "NAP_Set_LeagueSel";
    }

    public override bool IsValid()
    {
        return FromDate <= ToDate;
    }
}