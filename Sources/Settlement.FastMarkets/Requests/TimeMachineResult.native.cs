namespace Settlement.FastMarkets.Requests;

public class TimeMachineResult
{
    private const int FirstHalfInjuryTime = 45;

    public int HomeScore { get; set; }

    public int AwayScore { get; set; }

    public int Position { get; set; }

    public int TotalGoal { get; set; }

    public string PositionName
    {
        get
        {
            var interval = Position > FirstHalfInjuryTime ? Position - 1 : Position;
            return Position == FirstHalfInjuryTime ? "First Half Injury Time" : TimeMachineInterval(interval);
        }
    }

    private static string TimeMachineInterval(int position)
    {
        const int nineMinute = 9;

        if (position == 0)
        {
            return $"0{position}:00-01:00";
        }

        if (position < nineMinute)
        {
            return $"0{position}:01-0{position + 1}:00";
        }

        if (position == nineMinute)
        {
            return $"0{position}:01-{position + 1}:00";
        }

        return $"{position}:01-{position + 1}:00";
    }
}