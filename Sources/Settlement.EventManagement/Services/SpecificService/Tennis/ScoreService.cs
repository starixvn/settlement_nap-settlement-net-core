namespace Settlement.EventManagement.Services.SpecificService.Tennis;

using Settlement.Core.Models;

public interface IScoreService
{
    bool IsRefundMatch(string totalSetHomeValue);

    Score TotalGame(string totalSetHomeValue, Score totalScore);
}

public class ScoreServiceImp : IScoreService
{
    public Score TotalGame(string totalSetHomeValue, Score totalScore)
    {
        return IsRefundMatch(totalSetHomeValue) ? new Score(SetStatus.Refund, SetStatus.Refund) : totalScore;
    }

    public bool IsRefundMatch(string totalSetHomeValue)
    {
        return !string.IsNullOrWhiteSpace(totalSetHomeValue) && totalSetHomeValue.Equals(SetStatus.Refund);
    }
}