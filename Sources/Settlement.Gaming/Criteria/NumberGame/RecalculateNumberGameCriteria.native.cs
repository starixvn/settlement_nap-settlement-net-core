using Fanex.Data;
using Fanex.Data.Repository;

namespace Settlement.Gaming.Criteria.NumberGame;

public class RecalculateNumberGameCriteria : NonQueryCommand
{
    public int MatchId { get; set; }

    public string BallResults { get; set; }

    public string Ip { get; set; }

    public int AdminId { get; set; }

    public int ErrCode { get; set; }

    public string ErrMsg { get; set; }

    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    [SpParam(Ignored = true)]
    public string SpName => "NAP_Admin_Settlement_s161_Manual";

    public override string GetSettingKey()
    {
        return $"NAP_Admin_Settlement_s161_Manual_{DbServer}";
    }

    public override bool IsValid()
    {
        return MatchId > 0 && AdminId > 0;
    }
}