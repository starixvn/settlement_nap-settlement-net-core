using Settlement.FastMarkets.Constants;
using Settlement.FastMarkets.Models;

namespace Settlement.FastMarkets.Services;

public interface ResultLabelService
{
    ResultItemLabel NextOneMinuteSetPiece();

    ResultItemLabel NextFiveMinutes(string odd);

    ResultItemLabel TimeMachineHdp();
}

public class ResultLabelServiceImp : ResultLabelService
{
    public ResultItemLabel NextOneMinuteSetPiece()
    {
        return new ResultItemLabel { None = "No", Goal = "Yes <a title='Corner, Free Kick or Throw In'>(!)</a>" };
    }

    public ResultItemLabel NextFiveMinutes(string odd)
    {
        if (string.IsNullOrWhiteSpace(odd))
        {
            return new ResultItemLabel
            {
                IsSetDefaultValue = true,
                Goal = "0.5",
                Corner = "0.5",
                FreeKick = "1.5",
                GoalKick = "0.5",
                ThrowIn = "2.5",
                Penalty = "0.5"
            };
        }

        var name = odd.Split(',');
        return new ResultItemLabel
        {
            Goal = ResultName(name, PositionResult.Goal),
            Corner = ResultName(name, PositionResult.Corner),
            FreeKick = ResultName(name, PositionResult.FreeKick),
            GoalKick = ResultName(name, PositionResult.GoalKick),
            ThrowIn = ResultName(name, PositionResult.ThrowIn),
            Penalty = ResultName(name, PositionResult.Penalty)
        };
    }

    private static string ResultName(string[] name, int index)
    {
        return name.Length > 0 ? name[index].Split(':')[1] : string.Empty;
    }

    public ResultItemLabel TimeMachineHdp()
    {
        return new ResultItemLabel { None = "Home", Goal = "Away" };
    }
}