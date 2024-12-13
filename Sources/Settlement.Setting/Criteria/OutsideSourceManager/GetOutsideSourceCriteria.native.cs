namespace Settlement.Setting.Criteria.OutsideSourceManager;

public class GetOutsideSourceCriteria : CriteriaBase
{
    public string GameTypes { get; set; }

    public int SourceType { get; set; }

    public string SourceName { get; set; }

    public int SourceStatus { get; set; }

    public int Sporttype { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Set_ProviderInfoSel";
    }

    public override bool IsValid()
    {
        return SourceType > -1;
    }
}