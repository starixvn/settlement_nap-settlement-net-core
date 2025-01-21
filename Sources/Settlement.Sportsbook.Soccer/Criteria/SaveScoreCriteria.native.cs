using Settlement.Core.Models;

namespace Settlement.Sportsbook.Soccer.Criteria;
public class SaveScoreCriteria : NonQueryCommand, IReturnValue
{
    public int MatchId { get; set; }

    public int UserId { get; set; }

    public string SelectedResources { get; set; }

    public int ErrCode { get; set; }

    public string ErrMsg { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Set_ExternalResultDetailUpd";
    }

    public override bool IsValid()
    {
        return MatchId > 0;
    }
}
