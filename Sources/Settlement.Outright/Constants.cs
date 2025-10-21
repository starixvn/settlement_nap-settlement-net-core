namespace Settlement.Outright;

public static class Status
{
    public const string Running = "running";
    public const string Won = "won";
    public const string Lose = "lose";
    public const string Refund = "refund";
    public const string Completed = "completed";
    public const string Internal = "internal";
    public const string Closed = "closed";
    public const string Hide = "hide";
    public const string Undo = "undo";
}

public static class StatusGroups
{
    public static readonly IReadOnlySet<string> RunningStatus = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        Status.Running,
        Status.Internal,
        Status.Closed
    };

    public static readonly IReadOnlySet<string> CompletedStatus = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        Status.Won,
        Status.Lose,
        Status.Refund,
        Status.Hide
    };
}