using Fanex.Data.Repository;
using Fanex.Logging;
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
        try
        {
            var criteria = new LogDirectlyCriteria
            {
                Extend = matchId,
                Doing = message,
                UserId = session.UserId,
            };

            repository.Execute(criteria);
        }
        catch (Exception e)
        {
            LogService.Error("Settlement.WebSites(Write Log Directly): ", e);
        }
    }

    public static string GenerateLogData(Match match, string actionName)
    {
        return $"NAP:Calculate({actionName}) for matchId: {match.MatchId} score: "
               + $"{match.FinalHomeScore ?? 0}-{match.FinalAwayScore ?? 0} HT: {match.HalfTimeHomeScore ?? 0}-{match.HalfTimeAwayScore ?? 0} "
               + $"GoalRecord: {match.GoalRecord} Remark({match.BetStatus})";
    }

    public static string CreateEarlyLog(string action, int matchId, string selectedResources)
        => $"NAP: Auto-Settlement ({action}) for matchId: {matchId} Result: {selectedResources}";

    public static string CreateInstantLog(int matchId, string mode, string score)
        => $"NAP: Instant Uncalculate {mode} for matchId: {matchId} Score: {score} Instant action: {mode}";

    public static string CreateHappyFive(int matchId) => $"Settlement for matchid: {matchId}";

    public static string CreateProfileLog(ProfileLog profileLog) =>
        $"NAP: Calculate {profileLog.Action} for matchid: {profileLog.MatchId} Result: {profileLog.Resources} <br/> Betstatus ({profileLog.BetStatus})";

    public static string CreateBetBuilderLog(ProfileLog profileLog) =>
        $"NAP: Calculate {profileLog.Action} for matchid: {profileLog.MatchId} {(string.IsNullOrEmpty(profileLog.Resources) ? "" : profileLog.Resources + "<br/>")}   ; IsAuto:false; Bettype:38";

    public static string CreateNumberGameLog(ProfileLog profileLog) =>
        $"NAP: Calculate {profileLog.Action} for matchid: {profileLog.MatchId} {(string.IsNullOrEmpty(profileLog.Resources) ? "" : profileLog.Resources + "<br/>")}   ; IsAuto:false; Bettype:38";
}

public record ProfileLog(int MatchId, string Action, string Resources, string BetStatus);