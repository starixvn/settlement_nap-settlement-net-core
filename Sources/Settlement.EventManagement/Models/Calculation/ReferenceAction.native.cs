namespace Settlement.EventManagement.Models.Calculation;

[MessagePackObject]
public class ReferenceAction
{
    private const int HalftimeAction = 178;
    private const int FullTimeAction = 179;
    private const int HalftimeAutoAction = 195;
    private const int FullTimeAutoAction = 196;

    private readonly Dictionary<int, string> actionNames = new()
    {
        { 100, "All" },
        { 101, "FT(M)" },
        { 102, "HT(M)" },
        { 103, "Uncalculate" },
        { 104, "Parlay" },
        { 151, "All Corner" },
        { 157, "HT(A)" },
        { 158, "FT(A)" },
        { 161, "FT Corner" },
        { 162, "HT Corner" },
        { 163, "FT FGLG" },
        { 164, "HT FGLG" },
        { 178, "(HT)" },
        { 179, "(FT)" },
        { 182, "Uncalculate Ins.Settle" },
        { 195, "(HT-A)" },
        { 196, "(FT-A)" }
    };

    [Key("matchId")]
    public int MatchId { get; set; }

    [Key("actionId")]
    public int ActionId { get; set; }

    [Key("isFailed")]
    public bool IsFailed { get; set; }

    [Key("homeScore")]
    public int HomeScore { get; set; }

    [Key("awayScore")]
    public int AwayScore { get; set; }

    [Key("actionName")]
    public string ActionName
    {
        get
        {
            if (!actionNames.ContainsKey(ActionId))
            {
                return string.Empty;
            }

            var actionName = actionNames[ActionId];
            if (IsShowScore)
            {
                actionName = $"{HomeScore}-{AwayScore} {actionName}";
            }

            return actionName;
        }
    }

    [Key("className")]
    public string ClassName => IsFailed ? "fail" : string.Empty;

    [IgnoreMember]
    private bool IsShowScore => ActionId is HalftimeAction or FullTimeAction or HalftimeAutoAction or FullTimeAutoAction;
}