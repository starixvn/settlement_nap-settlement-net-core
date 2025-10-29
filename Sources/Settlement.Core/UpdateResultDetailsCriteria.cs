using Fanex.Data.Repository;

namespace Settlement.Core;

public class UpdateResultDetailsCriteria : NonQueryCommand
{
    public int MatchId { get; set; }

    public int UserId { get; set; }

    public string SelectedResources { get; set; }

    public int ErrCode { get; set; }

    public string ErrMsg { get; set; }

    public override string GetSettingKey() => "NAP_Set_ResultDetailUpd";

    public override bool IsValid() => MatchId > 0 && !string.IsNullOrEmpty(SelectedResources);
}
