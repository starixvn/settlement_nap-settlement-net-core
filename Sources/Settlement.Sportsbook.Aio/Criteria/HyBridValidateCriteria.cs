namespace Settlement.Sportsbook.Aio.Criteria;
public class HyBridValidateCriteria : INonQueryCommand
{
    public int MatchId { get; set; }

    public int ErrCode { get; set; }

    public string ErrMsg { get; set; }

    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    public string GetSettingKey() => $"NAP_Set_HybridParlay_Validate_{DbServer}";

    public bool IsValid() => MatchId > 0;
}
