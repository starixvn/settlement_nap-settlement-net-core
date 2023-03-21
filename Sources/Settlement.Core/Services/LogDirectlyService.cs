using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Settlement.Core.Criteria;
using Settlement.Core.Models;

namespace Settlement.Core.Services;
public interface LogDirectlyService
{
    void WriteLog(int matchId, string message);
}

public class LogDirectlyServiceImp : LogDirectlyService
{
    private readonly IDynamicRepository repository;
    private readonly INapSession session;


    public LogDirectlyServiceImp(IDynamicRepository repository, INapSession session)
    {
        this.repository = repository;
        this.session = session;
    }

    public void WriteLog(int matchId, string message)
    {
        //LogService.Warn("Fanex.Settletment.WebSites(Write Log Directly): ", message);
        Console.WriteLine("Fanex.Settletment.WebSites(Write Log Directly): ", message);

        try
        {
            var criteria = new LogDirectlyCriteria
            {
                Extend = matchId,
                Doing = message,
                UserID = session.UserId,
            };

            repository.Execute(criteria);
        }
        catch (Exception e)
        {
            //LogService.Error("Fanex.Settletment.WebSites(Write Log Directly): ", e);
            Console.WriteLine(e);
            throw;
        }

    }

    public static string GenerateLogData(Match match, string actionName)
    {
        var message = $"NAP:Calculate({actionName}) for matchid: {match.MatchId} score: {match.FinalHomeScore ?? 0}-{match.FinalAwayScore ?? 0} HT: {match.HalfTimeHomeScore ?? 0}-{match.HalfTimeAwayScore ?? 0} GoalRecord: {match.GoalRecord} Remark({match.BetStatus})";

        return message;
    }

    public static string CreateEarlyLog(string action, int matchId, string selectedResources)
        => $"NAP: Auto-Settlement ({action}) for matchid: {matchId} Result: {selectedResources}";

    public static string CreateInstantLog(int matchId, string mode, string score)
        => $"NAP: Instant Uncalculate {mode} for matchid: {matchId} Score: {score} Instant action: {mode}";
}