using AutoMapper;
using Fanex.Data.Repository;
using Fanex.Settlement.ScaleOut.Constants;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.Extensions.Options;
using Settlement.Core.Constants;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Requests;

namespace Settlement.Sportsbook.Soccer.Services;

public interface SettleEarlyService
{
    public Task<Result> CalculateEarly(SettleEarlyRequest request);
}

public class SettleEarlyServiceImp : SettleEarlyService
{
    private readonly ICreateCriteriaService createCriteriaService;

    private readonly AppSettingsKey appSettingsKey;

    private readonly IDynamicRepository repository;

    private readonly ScaleOutSettleService scaleOutSettleService;

    private readonly LogService logService;

    private readonly XmlConvertService xmlConvertService;

    private readonly IMapper mapper;

    public SettleEarlyServiceImp(
        ICreateCriteriaService createCriteriaService,
        IOptions<AppSettingsKey> appSettingsKey,
        IDynamicRepository repository,
        ScaleOutSettleService scaleOutSettleService,
        LogService logService,
        XmlConvertService xmlConvertService,
        IMapper mapper)
    {
        this.createCriteriaService = createCriteriaService;
        this.appSettingsKey = appSettingsKey.Value;
        this.repository = repository;
        this.scaleOutSettleService = scaleOutSettleService;
        this.logService = logService;
        this.xmlConvertService = xmlConvertService;
        this.mapper = mapper;
    }

    public async Task<Result> CalculateEarly(SettleEarlyRequest request)
    {
        var criteria = createCriteriaService.CreateCalculateEarlyCriteria(request);
        var requestChecking = await ValidateBeforeExecute(criteria);
        if (requestChecking.ErrCode > 0)
        {
            return requestChecking;
        }

        WriteDirectlyLog(request);
        InsertLog(criteria);
        await UpdateMatchInfo(criteria);

        var result = await Execute(criteria);

        return result;
    }

    private void InsertLog(CalculateEarlyCriteria criteria)
    {
        try
        {
            var insertLogCriteria = mapper.Map<InsertLogCriteria>(criteria);
            insertLogCriteria.Sporttype = SportType.Soccer;
            repository.Execute(insertLogCriteria);
        }
        catch (Exception e)
        {
            Fanex.Logging.LogService.Error("Settlement.WebSites(Write resettle Log): ", e);
        }
    }

    private void WriteDirectlyLog(SettleEarlyRequest request)
    {
        var selectedResources = xmlConvertService.Serialize(request.SelectedResources).Replace("ResourceItem", "Resource");
        var message = $"NAP: Auto-Settlement ({request.ActionName}) for matchId: {request.MatchId} Result: {selectedResources}";

        logService.WriteLog(request.MatchId, message);
    }

    private async Task<Result> Execute(CalculateEarlyCriteria criteria)
    {
        foreach (var server in appSettingsKey.SiteDbServer)
        {
            criteria.DbServer = server;
            await repository.ExecuteAsync(criteria);
        }

        return new Result
        {
            ErrCode = criteria.ErrCode,
            ErrMsg = criteria.ErrMsg
        };
    }

    private async Task<Result> ValidateBeforeExecute(CalculateEarlyCriteria criteria)
    {
        var request = new EventTicketRequest
        {
            MatchId = criteria.MatchId,
            Action = criteria.Action,
            SpName = criteria.SpName,
            Mode = Mode.Early,
            SelectedResources = criteria.SelectedResources
        };
        var resultMessage = await scaleOutSettleService.ValidateEventAndTicket(request);
        return new Result
        {
            ErrCode = resultMessage.ErrorCode,
            ErrMsg = resultMessage.ErrorMessage
        };
    }

    private async Task UpdateMatchInfo(CalculateEarlyCriteria criteria)
    {
        var requestUpdateInfo = new UpdateMatchInfoRequest
        {
            Action = criteria.Action,
            AdminId = criteria.AdminId,
            MatchId = criteria.MatchId,
            SelectedResources = criteria.SelectedResources
        };

        await scaleOutSettleService.UpdateMatchInfo(requestUpdateInfo);
    }
}