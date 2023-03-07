namespace Settlement.Setting.Models.OutsideSourceManager;

public class QueryResultModel
{
    public int SourceId { get; set; }

    public string SourceName { get; set; }

    public string Remark { get; set; }

    public bool SourceStatus { get; set; }

    public int GameType { get; set; }

    public int OrderNo { get; set; }

    public bool IsActive { get; set; }

    public int SportType { get; set; }
}