using Fanex.Data.Repository;

namespace Settlement.Setting.Criteria.OutsideSourceManager;

public class UpdateLeagueOutsideSourceCriteria : NonQueryCommand
{
    public int LeagueId { get; set; }

    public string PGIdSources { get; set; }

    public int ErrCode { get; set; }

    public string ErrMsg { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Set_OutsideSourceByLeagueIns";
    }

    public override bool IsValid()
    {
        return LeagueId > 0;
    }
}