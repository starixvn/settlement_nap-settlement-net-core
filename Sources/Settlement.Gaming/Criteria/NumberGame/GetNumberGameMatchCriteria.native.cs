using Fanex.Data.Repository;

namespace Settlement.Gaming.Criteria.NumberGame;

public class GetNumberGameMatchCriteria : CriteriaBase
{
    public string MatchCode { get; set; }

    public string MatchStatus { get; set; }

    public DateTime FromDate { get; set; } = DateTime.Now.AddDays(-1);

    public DateTime ToDate { get; set; } = DateTime.Now;

    public override string GetSettingKey()
    {
        return "NAP_Set_MatchSelNumberGame";
    }

    public override bool IsValid()
    {
        return FromDate <= ToDate;
    }
}