namespace Settlement.EventManagement.Models.MultiSports;

[MessagePackObject]
public class MultiSportModel
{
    [Key("permission")]
    public Permission Permission { get; set; }

    [Key("sports")]
    public List<SportModel> Sports { get; set; }
}