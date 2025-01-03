namespace Settlement.Setting.Criteria.OutsideSourceManager;

public class AddOutsideSourceCriteria : NonQueryCommand
{
    public int NewSourceId { get; set; }

    public string SourceName { get; set; }

    public string Remark { get; set; }

    public string GameTypes { get; set; }

    public int SportType { get; set; }

    public int ErrCode { get; set; }

    public string ErrMsg { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Set_ProviderGameTypeMapping";
    }

    public override bool IsValid()
    {
        return !string.IsNullOrEmpty(SourceName);
    }
}