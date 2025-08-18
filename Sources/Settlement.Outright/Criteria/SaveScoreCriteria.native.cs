using Fanex.Data.Repository;

public class SaveScoreCriteria : INonQueryCommand
{
    public int LeagueId { get; set; }

    public int UserId { get; set; }

    public string SelectedResources { get; set; }

    public string ErrMsg { get; set; }

    public int ErrCode { get; set; }

    public string GetSettingKey() => "NAP_Set_OutrightResultDetailUpd";

    public bool IsValid() => LeagueId > 0;
}