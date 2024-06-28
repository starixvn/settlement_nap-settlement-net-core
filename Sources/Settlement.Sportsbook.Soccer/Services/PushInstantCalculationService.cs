using Settlement.Models;
using Settlement.Services;
using Settlement.Sportsbook.Soccer.Criteria;

namespace Settlement.Sportsbook.Soccer.Services;

public interface PushInstantCalculationService
{
    Task Execute(PushInstantCalculationCriteria criteria);
}

public class PushInstantCalculationServiceImp(
    IDynamicRepository repository,
    IHttpContextAccessor accessor,
    LogService logService,
    IOptions<AppSettingsKey> appSettingsKey)
    : PushInstantCalculationService
{
    public async Task Execute(PushInstantCalculationCriteria criteria)
    {
        criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();

        WriteLogDirectly(criteria);

        foreach (var server in appSettingsKey.Value.SiteDbServer)
        {
            criteria.DbServer = server;
            await repository.ExecuteAsync(criteria);
        }
    }

    private void WriteLogDirectly(PushInstantCalculationCriteria criteria)
    {
        var score = $"{criteria.HomeScore}-{criteria.AwayScore}";
        var message = $"NAP: Instant Uncalculate {criteria.Action} for matchId: {criteria.MatchId} Score: {score}";
        logService.WriteLog(criteria.MatchId, message);
    }
}