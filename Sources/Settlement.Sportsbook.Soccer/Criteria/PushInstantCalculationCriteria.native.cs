using Fanex.Data;
using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Soccer.Criteria;

public class PushInstantCalculationCriteria : NonQueryCommand
{
    public int AdminId { get; set; }

    public int MatchId { get; set; }

    //public int InstantKey { get; set; }

    public string HomeScore { get; set; }

    public string AwayScore { get; set; }

    public string Action { get; set; }

    //public string Mode { get; set; }

    public string Ip { get; set; }

    public string ResourceResult { get; set; }

    public string GoalRecord { get; set; }

    public string BroadcastSessionId { get; } = Guid.NewGuid().ToString();

    public int ErrCode { get; set; }

    public string ErrMsg { get; set; }

    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    public override string GetSettingKey()
    {
        return $"NAP_Admin_Settlement_InstantCalculation_Push_{DbServer}";
    }

    public override bool IsValid()
    {
        return MatchId > 0;
    }
}