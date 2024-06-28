using Fanex.Data.Repository;

namespace Settlement.Gaming.Criteria.Happy5;

public class GetMatchesCriteria : CriteriaBase
{
    public string MatchCode { get; set; }

    public string Status { get; set; }  

    public DateTime FromDate { get; set; }

    public DateTime ToDate { get; set; }

    public int SportType => Settlement.Constants.SportType.Happy5;

    public override string GetSettingKey()
    {
        return "NAP_Set_MatchSel_s164";
    }

    public override bool IsValid()
    {
        return FromDate <= ToDate;
    }
}