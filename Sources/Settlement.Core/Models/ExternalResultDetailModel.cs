namespace Settlement.Core.Models;

public class ExternalResultDetailModel
{
    public int ProviderExternalId { get; set; }

    public int MatchId { get; set; }

    public int SourceId { get; set; }

    public string SourceName { get; set; }

    public string ResourceId { get; set; }

    public string HomeValue { get; set; }

    public string AwayValue { get; set; }

    public string OtherInfo { get; set; }

    public int OrderNo { get; set; }

    public string Remark { get; set; }

    public DateTime CreateDate { get; set; }
}