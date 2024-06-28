using MessagePack;

namespace Settlement.Models;

[MessagePackObject]
public class GoalIcon
{
    [Key("homeGoal")]
    public string HomeGoal { get; set; }

    [Key("awayGoal")]
    public string AwayGoal { get; set; }

    [Key("halfTimeHomeGoal")]
    public string HalfTimeHomeGoal { get; set; }

    [Key("halfTimeAwayGoal")]
    public string HalfTimeAwayGoal { get; set; }
}