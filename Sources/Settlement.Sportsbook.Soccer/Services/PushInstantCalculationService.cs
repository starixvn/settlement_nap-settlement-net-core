using Fanex.Data.Repository;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Soccer.Criteria;

namespace Settlement.Sportsbook.Soccer.Services;

public interface PushInstantCalculationService
{
    Task Execute(PushInstantCalculationCriteria criteria);
}

public class PushInstantCalculationServiceImp : PushInstantCalculationService
{
    private readonly IDynamicRepository repository;
    private readonly IHttpContextAccessor accessor;
    private readonly LogService logService;
    private readonly AppSettingsKey appSettingsKey;

    public PushInstantCalculationServiceImp(
        IDynamicRepository repository,
        IHttpContextAccessor accessor,
        LogService logService,
        IOptions<AppSettingsKey> appSettingsKey)
    {
        this.repository = repository;
        this.accessor = accessor;
        this.logService = logService;
        this.appSettingsKey = appSettingsKey.Value;
    }

    public async Task Execute(PushInstantCalculationCriteria criteria)
    {
        criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();

        WriteLogDirectly(criteria);

        foreach (var server in appSettingsKey.SiteDbServer)
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