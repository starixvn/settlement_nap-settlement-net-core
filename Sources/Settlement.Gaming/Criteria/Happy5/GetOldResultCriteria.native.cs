using Fanex.Data.Repository;

namespace Settlement.Gaming.Criteria.Happy5;

public class GetOldResultCriteria : NonQueryCommand
{
    public int MatchId { get; set; }

    public string StrOldResult { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Admin_GetOldResult_s164_Sel";
    }

    public override bool IsValid()
    {
        return MatchId > 0;
    }
}