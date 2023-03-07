using Settlement.FastMarkets.Constants;
using System.Linq;

namespace Settlement.FastMarkets.Models;

public class EventCounter
{
    private EventResultItem eventResultItem;

    public int Position { get; set; }

    public string PositionName
    {
        get
        {
            const int tenMinutes = 10;
            return Position < tenMinutes ? $"0{Position}:00-0{Position}:59" : $"{Position}:00-{Position}:59";
        }
    }

    public string Result { get; set; }

    public bool Checked { get; set; }

    public bool IsShow { get; set; }

    public EventResultItem EventResultItem
    {
        get
        {
            if (!Checked)
            {
                eventResultItem = ResultMapping(Result);
            }

            return eventResultItem;
        }
        set
        {
            eventResultItem = value;
        }
    }

    private static EventResultItem ResultMapping(string result)
    {
        if (!string.IsNullOrWhiteSpace(result))
        {
            var resultArray = result.Reverse().ToArray();
            return new EventResultItem
            {
                Goal = resultArray[PositionResult.Goal].ToString(),
                Corner = resultArray[PositionResult.Corner].ToString(),
                FreeKick = resultArray[PositionResult.FreeKick].ToString(),
                GoalKick = resultArray[PositionResult.GoalKick].ToString(),
                ThrowIn = resultArray[PositionResult.ThrowIn].ToString(),
                Penalty = resultArray[PositionResult.Penalty].ToString()
            };
        }
        else
        {
            return new EventResultItem();
        }
    }
}