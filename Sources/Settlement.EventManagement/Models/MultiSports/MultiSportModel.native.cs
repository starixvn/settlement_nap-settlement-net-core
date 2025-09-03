namespace Settlement.EventManagement.Models.MultiSports;

[MessagePackObject]
public class MultiSportModel
{
    [Key("permission")]
    public Permission Permission { get; set; } = new();

    [Key("sports")]
    public List<SportModel> Sports { get; set; } = [];
}