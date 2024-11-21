
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Setting.Constants;
using Settlement.Setting.Criteria;
using Settlement.Setting.Factories;
using Settlement.Setting.Requests;

namespace Settlement.Setting.Handlers;

public class UpdateAutoSettingsHandler : IRequestHandler<UpdateAutoSettingsCommand, Result>
{
    private readonly IDynamicRepository repository;
    private readonly INapSession currentSession;
    private readonly IHttpContextAccessor accessor;
    private readonly LogService logService;

    private const int ActionChangeLeagueSettingsId = 81048;

    public UpdateAutoSettingsHandler(
        IDynamicRepository repository,
        IHttpContextAccessor accessor,
        LogService logService,
        INapSession napSession)
    {
        this.repository = repository;
        this.accessor = accessor;
        this.logService = logService;
        this.currentSession = napSession;
    }

    public async Task<Result> Handle(UpdateAutoSettingsCommand command, CancellationToken cancellationToken)
    {
        var results = new List<Result>();

        foreach (var item in command.ResultSettings)
        {
            var result = await ProcessResultSetting(command, item);
            results.Add(result);
        }

        return new Result();
    }

    private async Task<Result> ProcessResultSetting(UpdateAutoSettingsCommand command, UpdateResultSettingItem item)
    {
        var result = item.SettleType != AutoSettleType.AutoRefund
            ? await EnableAutoSettle(command, item)
            : new Result();

        var sourceCriteria = CreateSettingSourceCriteria(command, item);
        await repository.ExecuteAsync(sourceCriteria);

        await WriteLogUpdateSetting(command, item, result);

        return result;
    }

    private async Task<Result> EnableAutoSettle(UpdateAutoSettingsCommand command, UpdateResultSettingItem item)
    {
        var criteria = CreateSettingRunCriteriaFactory(command, item);
        await repository.ExecuteAsync(criteria);

        return new Result
        {
            ErrCode = criteria.ErrCode,
            ErrMsg = criteria.ErrMsg,
            ChildMatchIds = criteria.UpdatedMatchIDs
        };
    }


    private AutoSettleRunUpdateCriteria CreateSettingRunCriteriaFactory(UpdateAutoSettingsCommand command, UpdateResultSettingItem item)
    {
        var bitAutoType = item.ResourceType == ResourceType.Main && item.SettleType == AutoSettleType.AutoPayout
            ? AutoSettleBitPosition.AutoPayoutMain
            : AutoSettleBitPosition.AutoPayoutEarly;

        AutoSettleRunUpdateCriteria criteria = command.TypeObject == "League"
               ? new LeagueAutoSettleRunUpdateCriteria
               {
                   AutoType = bitAutoType,
                   IsEnabled = item.Enabled,
                   IsApplyAll = command.IsApplyAll,
                   LeagueId = command.LeagueId,
                   AdminId = currentSession.UserId,
                   Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString()
               }
               : new MatchAutoSettleRunUpdateCriteria
               {
                   AutoType = bitAutoType,
                   IsEnabled = item.Enabled,
                   MatchId = command.MatchId,
                   AdminId = currentSession.UserId,
                   Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString()
               };
        return criteria;
    }

    private async Task WriteLogUpdateSetting(UpdateAutoSettingsCommand command, UpdateResultSettingItem item, Result result)
    {
        var oldItem = command.OldResultSettings
            .First(x => x.ResourceType == item.ResourceType && x.SettleType == item.SettleType);

        var differences = GetSpecificDifferences(oldItem, item);

        var objectInfo = command.TypeObject == "League" ? $"League({command.LeagueId})" : $"Match({command.MatchId})";
        var settingTypeInfo = $"for {item.SettleType} {item.ResourceType} ";

        var childMatchInfo = command.IsApplyAll && !string.IsNullOrEmpty(result.ChildMatchIds) ? $"Effect child match: {result.ChildMatchIds}" : string.Empty;

        var msg = $"NAP: Update auto setting on {objectInfo} {settingTypeInfo} has isApplyAll({command.IsApplyAll.ToString()}) {childMatchInfo} {differences}";

        var actionLogId = GetActionLogId(command.TypeObject, item.ResourceType);

        await logService.WriteLog(msg, actionLogId);
    }

    private int GetActionLogId(string typeObject, ResourceType resourceType)
    {
        return (typeObject, resourceType) switch
        {
            ("League", ResourceType.Main) => 81055,
            ("League", ResourceType.Early) => 81056,
            ("Match", ResourceType.Main) => 81057,
            ("Match", ResourceType.Early) => 81058,
            _ => 81055 // Default case
        };
    }


    private string GetSpecificDifferences(UpdateResultSettingItem firstObject, UpdateResultSettingItem secondObject)
    {
        var result = new StringBuilder();
        List<string> specificProperties = ["Enabled", "WaitingTime", "IsTraderRequired", "MinProvider", "PrimaryProvider", "SecondaryProvider", "InactiveProvider"];
        var type = typeof(UpdateResultSettingItem);

        foreach (var propertyName in specificProperties)
        {
            var property = type.GetProperty(propertyName, BindingFlags.Public | BindingFlags.Instance);
            if (property != null)
            {
                var value1 = property.GetValue(firstObject);
                var value2 = property.GetValue(secondObject);

                if (!Equals(value1, value2))
                {
                    result.Append($"<br/>{propertyName}: {value1} -> {value2}");
                }
            }
        }

        return result.ToString();
    }

    private INonQueryCommand CreateSettingSourceCriteria(UpdateAutoSettingsCommand command, UpdateResultSettingItem item)
    {
        SettingSourceCriteriaStrategy strategy = command.TypeObject switch
        {
            "League" => new LeagueSettingSourceCriteriaStrategy(),
            "Match" => new MatchCriteriaStrategy(),
            _ => throw new ArgumentException("Invalid TypeObject")
        };

        var context = new SettingSourceContext(strategy);
        return context.CreateCriteria(command, item);
    }
}