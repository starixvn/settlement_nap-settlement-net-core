namespace Settlement.Sportsbook.Soccer.Criteria;

public class SaveOutsideScoreCriteria : INonQueryCommand
{
    public int MatchId { get; set; }

    public int UserId { get; set; }

    public string OutsideSources { get; set; }

    public string Sources { get; set; }

    public bool IsTrader { get; set; }

    public string Ip { get; set; }

    public int ErrCode { get; set; }

    public string ErrMsg { get; set; }

    public string GetSettingKey() => "NAP_Set_ExternalResultDetailOSIns";

    public bool IsValid() => true;
}
