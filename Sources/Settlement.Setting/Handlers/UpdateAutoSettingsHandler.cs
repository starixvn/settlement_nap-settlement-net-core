using System.Reflection;
using System.Text;
using Fanex.Data.Repository;
using Fanex.NAP.Client;
using Microsoft.AspNetCore.Http;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Setting.Constants;
using Settlement.Setting.Criteria;
using Settlement.Setting.Requests;

namespace Settlement.Setting.Handlers;

public class UpdateAutoSettingsHandler
{
    private readonly IDynamicRepository repository;
    private readonly INapSession currentSession;
    private readonly IHttpContextAccessor accessor;
    private readonly LogService logService;

    private const int ActionChangeLeagueSettingsId = 81048;

    public UpdateAutoSettingsHandler(IDynamicRepository repository)
    {
        this.repository = repository;
    }
    public async Task HandleAsync(UpdateAutoSettingsCommand command, CancellationToken cancellationToken)
    {
        foreach (var item in command.ResultSettings)
        {
            var effectChildMatchIds = "";
            //enable auto
            if (item.SettleType != AutoSettleType.AutoRefund)
            {
                var result = await EnableAutoSettle(command, item);
                effectChildMatchIds = result.ChildMatchIds;
            }
            //add source
            var sourceCriteria = CreateSettingSourceCriteria(command, item);
            //await repository.ExecuteAsync(sourceCriteria);

            //log
            await WriteLogUpdateSetting(command, item, effectChildMatchIds);
        }
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
        var bitAutoType = item.ResourceType == ResourceType.Main && item.SettleType == AutoSettleType.AutoPayout ? (short)1 : (short)6;
        AutoSettleRunUpdateCriteria criteria = command.TypeObject == "League"
               ? new LeagueAutoSettleRunUpdateCriteria
               {
                   AutoType = bitAutoType,
                   IsEnabled = item.Enabled,
                   IsApplyAll = command.IsApplyAll,
                   LeagueId = command.LeagueId,
                   //AdminId = currentSession.UserId,
                   //Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString()
               }
               : new MatchAutoSettleRunUpdateCriteria
               {
                   AutoType = bitAutoType,
                   IsEnabled = item.Enabled,
                   MatchId = command.MatchId,
                   //AdminId = currentSession.UserId,
                   //Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString()
               };
        return criteria;
    }

    private async Task WriteLogUpdateSetting(UpdateAutoSettingsCommand command, UpdateResultSettingItem item, string effectChildMatchIds)
    {
        var oldItem = command.OldResultSettings.First(x => x.ResourceType == item.ResourceType && x.SettleType == item.SettleType);

        var differences = GetSpecificDifferences(oldItem, item);

        var objectInfo = command.TypeObject == "League" ? $"League({command.LeagueId})" : $"Match{command.MatchId}";
        var settingTypeInfo = $"for {item.SettleType} {item.ResourceType} ";

        var childMatchInfo = command.IsApplyAll && !string.IsNullOrEmpty(effectChildMatchIds) ? $"Effect child match: {effectChildMatchIds}" : string.Empty;

        var msg = $"NAP: Update auto setting on {objectInfo} {settingTypeInfo} has isApplyAll({command.IsApplyAll.ToString()}) {childMatchInfo} {differences}";

        //await logService.WriteLog(msg, ActionChangeLeagueSettingsId);
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
        var criteria = new UpdateLeagueAutoSettleSourceCriteria
        {
            AutoType = (byte)item.SettleType,
            LeagueId = command.LeagueId,

        };

        if (item.SettleType == AutoSettleType.AutoRefund)
        {
            criteria.Main_WaitingTime = item.WaitingTime;
            return criteria;
        }

        MapProviderDetails(item, criteria, isMain: item.ResourceType == ResourceType.Main);

        return criteria;
    }

    private void MapProviderDetails(UpdateResultSettingItem resultSetting, SourceSettleCriteriaBase criteria, bool isMain)
    {
        if (isMain)
        {
            criteria.Main_WaitingTime = resultSetting.WaitingTime;
            criteria.Main_HasTrader = resultSetting.IsTraderRequired;
            criteria.Main_NumberProvider = resultSetting.MinProvider;
            criteria.Main_PrimaryProvider = resultSetting.PrimaryProvider;
            criteria.Main_TotalPrimaryProvider = resultSetting.TotalPrimaryProvider;
            criteria.Main_SecondaryProvider = resultSetting.SecondaryProvider;
            criteria.Main_TotalSecondaryProvider = resultSetting.TotalSecondaryProvider;
            criteria.Main_InactiveProvider = resultSetting.InactiveProvider;
        }
        else
        {
            criteria.EAR_WaitingTime = resultSetting.WaitingTime;
            criteria.EAR_HasTrader = resultSetting.IsTraderRequired;
            criteria.EAR_NumberProvider = resultSetting.MinProvider;
            criteria.EAR_PrimaryProvider = resultSetting.PrimaryProvider;
            criteria.EAR_TotalPrimaryProvider = resultSetting.TotalPrimaryProvider;
            criteria.EAR_SecondaryProvider = resultSetting.SecondaryProvider;
            criteria.EAR_TotalSecondaryProvider = resultSetting.TotalSecondaryProvider;
            criteria.EAR_InactiveProvider = resultSetting.InactiveProvider;
        }
    }
}