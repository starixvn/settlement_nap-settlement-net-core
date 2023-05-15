using AutoMapper;
using Fanex.Data.Repository;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.Extensions.Options;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Outright.Criteria;

namespace Settlement.Outright.Services;

public interface OutrightSettleProcessService
{
    Task<Result> UpdateResultUndo(OutrightSettleCriteria criteria);

    Task<Result> OutrightSettleMultiSite(OutrightSettleCriteria criteria);

    Task<ResultOutright> ValidateRequest(string spName, IEnumerable<InfoValidate> teams);

    Task<Result> UpdateResultCalculate(OutrightSettleCriteria criteria);

    Task<bool> CheckOutrightVoidTicket(CheckOutrightVoidTicketRequest request);
}

public class OutrightSettleProcessServiceImp : OutrightSettleProcessService
{
    private readonly IDynamicRepository repository;

    private readonly AppSettingsKey appSettingsKey;

    private readonly ScaleOutSettleThirdPartyService scaleOutSettleService;

    private readonly IMapper mapper;

    private readonly IRefDataService refDataService;

    public OutrightSettleProcessServiceImp(IDynamicRepository repository,
        IOptions<AppSettingsKey> appSettingsKey,
        ScaleOutSettleThirdPartyService scaleOutSettleService,
        IMapper mapper,
        IRefDataService refDataService)
    {
        this.repository = repository;
        this.appSettingsKey = appSettingsKey.Value;
        this.scaleOutSettleService = scaleOutSettleService;
        this.mapper = mapper;
        this.refDataService = refDataService;
    }

    public async Task<Result> OutrightSettleMultiSite(OutrightSettleCriteria criteria)
    {
        var results = new List<Result>();
        foreach (var server in appSettingsKey.SiteDbServer)
        {
            criteria.DbServer = server;
            await repository.ExecuteAsync(criteria);
            results = ResultMessage(results, criteria.ErrMsg);
        }

        return new Result
        {
            ErrCode = results.Count,
            ErrMsg = string.Join("", results.Select(r => r.ErrMsg).ToArray())
        };
    }

    private static List<Result> ResultMessage(List<Result> results, string message)
    {
        if (!string.IsNullOrWhiteSpace(message))
        {
            var result = new ResultOutright
            {
                ErrMsg = $"<br/>- {message}"
            };

            results.Add(result);
        }

        return results;
    }

    public async Task<ResultOutright> ValidateRequest(string spName, IEnumerable<InfoValidate> teams)
    {
        var validateDeployFlag = await scaleOutSettleService.GetDeploymentInfo(new GetDeploymentInfoRequest { SPName = spName });

        if (validateDeployFlag.ErrorCode > 0)
        {
            return new ResultOutright
            {
                ErrCode = validateDeployFlag.ErrorCode,
                ErrMsg = validateDeployFlag.ErrorMessage
            };
        }

        return await ValidateMoveBetDay(teams);
    }

    private async Task<ResultOutright> ValidateMoveBetDay(IEnumerable<InfoValidate> teams)
    {
        const string eventTable = "outright";
        var listMatchFailed = new List<string>();
        var message = "";
        foreach (var team in teams)
        {
            var result = await scaleOutSettleService.ValidateMoveBetDay(team.MatchId, eventTable, team.EventDate);
            if (result.ErrorCode == 0)
            {
                continue;
            }

            listMatchFailed.Add(refDataService.GetTeamName(team.TeamId));
            message = string.IsNullOrEmpty(message) ? result.ErrorMessage : message;
        }

        return new ResultOutright
        {
            ErrCode = listMatchFailed.Count,
            ErrMsg = string.IsNullOrEmpty(message) ? message : $"{message}<br/>Team: {string.Join(", ", listMatchFailed)}"
        };
    }

    public async Task<Result> UpdateResultUndo(OutrightSettleCriteria criteria)
    {
        var updateResultCriteria = new UpdateResultOutrightCriteria
        {
            Action = criteria.Action,
            Status = criteria.Status,
            MatchId = criteria.MatchId,
            AdminId = criteria.AdminId
        };

        await repository.ExecuteAsync(updateResultCriteria);

        return new Result
        {
            ErrCode = updateResultCriteria.ErrCode,
            ErrMsg = updateResultCriteria.ErrMsg
        };
    }

    public async Task<Result> UpdateResultCalculate(OutrightSettleCriteria criteria)
    {
        var updateResultCriteria = mapper.Map<OutrightSettleCriteria, UpdateResultOutrightCriteria>(criteria);
        await repository.ExecuteAsync(updateResultCriteria);

        return new Result
        {
            ErrCode = updateResultCriteria.ErrCode,
            ErrMsg = updateResultCriteria.ErrMsg
        };
    }

    public async Task<bool> CheckOutrightVoidTicket(CheckOutrightVoidTicketRequest request)
    {
        var criteria = new OutrightVoidTicketCriteria
        {
            Orid = request.Orid,
        };

        var tasks = appSettingsKey.SiteDbServer
            .Select(async server =>
            {
                criteria.DbServer = server;
                return await repository.GetAsync<int>(criteria);
            });
        var results = await Task.WhenAll(tasks);
        await Task.CompletedTask;

        return results.Any(r => r == 1) && results.All(r => r != 0);
    }
}