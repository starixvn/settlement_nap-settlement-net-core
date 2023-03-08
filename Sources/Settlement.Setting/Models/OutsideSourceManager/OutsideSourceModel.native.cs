namespace Settlement.Setting.Models.OutsideSourceManager;

public class OutsideSourceModel
{
    public int SourceId { get; set; }

    public string SourceName { get; set; }

    public string Remark { get; set; }

    public bool SourceStatus { get; set; }

    public int SportType { get; set;}

    public string SportName { get; set;}

    public List<GameModel> Games { get; set; }
}