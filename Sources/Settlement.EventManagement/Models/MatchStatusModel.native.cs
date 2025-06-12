namespace Settlement.EventManagement.Models;

public class MatchStatusModel
{

    private int autoPayoutStatus;

    private int instantStatus;

    private const int failStatus = 3;

    public int MatchId { get; set; }

    public int AutoPayoutStatus
    {
        get => HasAutoPayoutFail ? failStatus : autoPayoutStatus;
        set => autoPayoutStatus = value;
    }

    public bool HasAutoPayoutFail { get; set; }

    public int InstantStatus
    {
        get => HasInstantFail ? failStatus : instantStatus;
        set => instantStatus = value;
    }

    public bool HasInstantFail { get; set; }
}

public class FailedAutoResource
{
    public int MatchId { get; set; }
    public string ResourceId { get; set; }
}