using Settlement.Core.Constants;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Setting.Constants;
using Settlement.Setting.Criteria;
using Settlement.Setting.Factories;
using Settlement.Setting.Requests;
using ResourceType = Settlement.Setting.Constants.ResourceType;

namespace Settlement.Setting.Handlers;

public class UpdateAutoSettingsHandler(
    IDynamicRepository repository,
    IHttpContextAccessor accessor,
    LogService logService,
    INapSession napSession)
    : IRequestHandler<UpdateAutoSettingsCommand, Result>
{
    private const string League = "League";

    public async Task<Result> Handle(UpdateAutoSettingsCommand command, CancellationToken cancellationToken)
    {
        var results = new List<Result>();

        foreach (var item in command.ResultSettings)
        {
            var result = await ProcessResultSetting(command, item);
            results.Add(result);
        }

        var resultFailed = results.Where(r => r.ErrCode > 0).ToList();

        return new Result
        {
            ErrCode = resultFailed.Count,
            ErrMsg = string.Join(" | ", resultFailed.Select(r => r.ErrMsg).ToArray())
        };
    }

    private async Task<Result> ProcessResultSetting(UpdateAutoSettingsCommand command, UpdateResultSettingItem item)
    {
        var result = item.SettleType != AutoSettleType.AutoRefund || item.SettleType != AutoSettleType.FastMarketAutoRefund
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

        AutoSettleRunUpdateCriteria criteria = string.Equals(command.TypeObject, League)
               ? new LeagueAutoSettleRunUpdateCriteria
               {
                   AutoType = bitAutoType,
                   IsEnabled = item.Enabled,
                   IsApplyAll = command.IsApplyAll,
                   LeagueId = command.LeagueId,
                   AdminId = napSession.UserId,
                   Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString()
               }
               : new MatchAutoSettleRunUpdateCriteria
               {
                   AutoType = bitAutoType,
                   IsEnabled = item.Enabled,
                   MatchId = command.MatchId,
                   AdminId = napSession.UserId,
                   Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString()
               };
        return criteria;
    }

    private async Task WriteLogUpdateSetting(UpdateAutoSettingsCommand command, UpdateResultSettingItem item, Result result)
    {
        var oldItem = command.OldResultSettings
            .FirstOrDefault(x => x.ResourceType == item.ResourceType && x.SettleType == item.SettleType);

        if (oldItem is null)
        {
            return;
        }

        var differences = GetSpecificDifferences(oldItem, item);

        if (string.IsNullOrEmpty(differences))
        {
            return;
        }

        var objectInfo = string.Equals(command.TypeObject, League) ? $"League({command.LeagueId})" : $"Match({command.MatchId})";
        var settingTypeInfo = $"for {item.SettleType} {item.ResourceType} ";

        var childMatchInfo = command.IsApplyAll && !string.IsNullOrEmpty(result.ChildMatchIds) ? $"Effect child match: {result.ChildMatchIds}" : string.Empty;

        var msg = $"NAP: Update auto setting on {objectInfo} {settingTypeInfo} has isApplyAll({command.IsApplyAll.ToString()}) {childMatchInfo} {differences}";

        var actionLogId = GetActionLogId(command.TypeObject);

        var logCriteria = new LogCriteria(command.MatchId, msg, actionLogId, napSession.UserId);

        await logService.WriteLog(logCriteria);
    }

    private static int GetActionLogId(string typeObject)
    {
        return (typeObject) switch
        {
            ("League") => ActionId.AutoPayoutSettingLeague,
            ("Match") => ActionId.AutoPayoutSettingMatch,
            _ => 0
        };
    }

    private static string GetSpecificDifferences(UpdateResultSettingItem firstObject, UpdateResultSettingItem secondObject)
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

    private static INonQueryCommand CreateSettingSourceCriteria(UpdateAutoSettingsCommand command, UpdateResultSettingItem item)
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