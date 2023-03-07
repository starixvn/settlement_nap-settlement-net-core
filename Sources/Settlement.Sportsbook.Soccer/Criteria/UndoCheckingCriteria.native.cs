using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Soccer.Criteria;

public class UndoCheckingCriteria : NonQueryCommand
{
    public int MatchId { get; set; }

    public int ErrCode { get; set; }

    public string ErrMsg { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Settlement_InstantCalculation_UndoChecking";
    }

    public override bool IsValid()
    {
        return MatchId > 0;
    }
}