using AutoMapper;
using Settlement.Core.Constants;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Setting.Constants;
using Settlement.Setting.Criteria;
using Settlement.Setting.Criteria.LeagueSettings;
using Settlement.Setting.Models;
using Settlement.Setting.Models.LeagueSettings;
using Settlement.Setting.Requests;
using Settlement.Setting.Requests.LeagueSettings;
using System.Text.Json;
using LogService = Settlement.Core.Services.LogService;

namespace Settlement.Setting.Services;

public interface SettingService
{
    Task<Result> UpdateSettingLeague(SettingLeagueRequest query);

    Task<Result> UpdateSettingMatch(SettingMatchRequest query);

    Task<RemarkQueryModel> GetRemarkInfo(int matchId);

    Task<Result> UpdateTimeSettingLeague(TimeSettingRequest request);

    Task<string> GetSetting(GetSettingRequest request);

    Task ProcessUpdateHoldMatchSetting(UpdateHoldMatchSettingRequest request);

    public Task<LeagueSettings> GetLeagueSettings(GetLeagueSettingsRequest request);
}

public class SettingServiceImp(
    IRefDataService refDataService,
    IDynamicRepository repository,
    INapSession currentSession,
    IHttpContextAccessor accessor,
    IMapper mapper,
    LogService logService,
    XmlConvertService xmlConvertService)
    : SettingService
{
    private const int holdMatchActionId = 81049;

    public async Task<Result> UpdateSettingLeague(SettingLeagueRequest query)
    {
        // TODO
        var criteria = mapper.Map<SettingLeagueRequest, UpdateSettingLeagueCriteria>(query);
        criteria.AdminId = currentSession.UserId;
        criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();

        await repository.ExecuteAsync(criteria);

        var result = new Result
        {
            ErrCode = criteria.ErrCode,
            ErrMsg = criteria.ErrMsg,
            ChildMatchIds = criteria.UpdatedMatchIds
        };

        WriteLogUpdateLeagueSetting(query, result);

        return result;
    }

    private void WriteLogUpdateLeagueSetting(SettingLeagueRequest query, Result result)
    {
        var autoTypeInfo = GetAutoTypeInfo(query.AutoType);

        var childMatchInfo = query.IsApplyAll && !string.IsNullOrEmpty(result.ChildMatchIds)
            ? $"Effect child match: {result.ChildMatchIds}"
            : string.Empty;

        var msg = $"NAP: Update auto setting on league({query.LeagueId}) has {autoTypeInfo}({query.IsEnabled.ToString()}) isApplyAll({query.IsApplyAll}) {childMatchInfo}";
        var logCriteria = new LogCriteria(0, msg, ActionId.AutoPayoutSettingLeague, currentSession.UserId);

        logService.WriteLog(logCriteria);
    }

    public async Task<Result> UpdateSettingMatch(SettingMatchRequest query)
    {
        var criteria = mapper.Map<SettingMatchRequest, UpdateSettingMatchCriteria>(query);
        criteria.AdminId = currentSession.UserId;
        criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();

        await repository.ExecuteAsync(criteria);
        var result = new Result
        {
            ErrCode = criteria.ErrCode,
            ErrMsg = criteria.ErrMsg
        };

        WriteLogUpdateMatchSetting(query);

        return result;
    }

    private void WriteLogUpdateMatchSetting(SettingMatchRequest query)
    {
        var autoTypeInfo = GetAutoTypeInfo(query.AutoType);

        var msg = $"NAP: Update auto setting on match({query.MatchId}) has {autoTypeInfo}({query.IsEnabled.ToString()})";
        var logCriteria = new LogCriteria(query.MatchId, msg, ActionId.AutoPayoutSettingMatch, currentSession.UserId);

        logService.WriteLog(logCriteria);
    }

    public async Task<RemarkQueryModel> GetRemarkInfo(int matchId)
    {
        var criteria = new GetRemarkInfoCriteria { MatchId = matchId };
        return await repository.GetAsync<RemarkQueryModel>(criteria);
    }

    public async Task ProcessUpdateHoldMatchSetting(UpdateHoldMatchSettingRequest request)
    {
        var changedSettings = request.HoldSettings.Except(request.OrgHoldSettings).ToList();

        if (changedSettings.Count == 0)
        {
            return;
        }

        var criteria = CreateUpdateHoldMatchSettingCriteria(request, changedSettings);

        var childMatches = await UpdateHoldMatchSetting(criteria);

        WriteLogUpdateHoldSetting(request, changedSettings, childMatches);
    }

    private void WriteLogUpdateHoldSetting(UpdateHoldMatchSettingRequest request, List<HoldSetting> changedSettings, string childMatches)
    {
        var remarkLogs = CreateRemarkLogs(request.MatchId, changedSettings, childMatches);

        var logCriteria = new LogCriteria
        {
            MatchId = request.MatchId,
            RemarkJson = JsonSerializer.Serialize(remarkLogs),
            ActionId = holdMatchActionId,
            UserId = currentSession.UserId
        };
        logService.WriteLog(logCriteria);
    }

    private List<RemarkLog> CreateRemarkLogs(int matchId, List<HoldSetting> changedSettings, string childMatches)
    {
        var childMatchRemark = GenerateChildMatchRemark(changedSettings, childMatches);
        var parentMatchRemark = string.Join(", ", changedSettings.Select(x => $"{x.Description}({(x.Value ? "yes" : "no")})"));
        var remarkLogs = new List<RemarkLog>
        {
            new (matchId,$"{parentMatchRemark}{childMatchRemark}")
        };

        var childMatchRemarkLogs = CreateChildMatchRemarkLogs(changedSettings, childMatches);
        remarkLogs.AddRange(childMatchRemarkLogs);

        return remarkLogs;
    }

    private List<RemarkLog> CreateChildMatchRemarkLogs(List<HoldSetting> changedSettings, string childMatches)
    {
        var changedChildMatchSettings = changedSettings.Where(x => x.IsApplyChild).ToList();
        if (changedChildMatchSettings.Any() && !string.IsNullOrEmpty(childMatches))
        {
            var childMatch = JsonSerializer.Deserialize<List<ChildMatchRemark>>(childMatches);

            return childMatch.Select(x =>
            {
                var changedNames = string.Join(",", changedChildMatchSettings.Select(c => $"{c.Description}({(c.Value ? "yes" : "no")})"));
                var parentMatchRemark = $"parent({x.ParentMatchId})";

                return new RemarkLog
                {
                    MatchId = x.MatchId,
                    Remark = $"{changedNames} {parentMatchRemark}"
                };
            }).ToList();
        }

        return [];
    }

    private async Task<string> UpdateHoldMatchSetting(UpdateHoldMatchSettingCriteria criteria)
    {
        await repository.ExecuteAsync(criteria);

        return criteria.ChildMatchList;
    }

    private string GenerateChildMatchRemark(List<HoldSetting> changedSettings, string childMatches)
    {
        if (!changedSettings.Exists(x => x.Type is HoldPosition.IsUndecided or HoldPosition.IsMtdHold))
        {
            return string.Empty;
        }

        if (changedSettings.TrueForAll(x => !x.IsApplyChild))
        {
            return " child(off)";
        }

        if (string.IsNullOrEmpty(childMatches))
        {
            return " child(0)";
        }

        var childMatchIds = JsonSerializer.Deserialize<List<ChildMatchRemark>>(childMatches);

        return $" child({string.Join(",", childMatchIds.Select(x => x.MatchId))})";
    }

    private UpdateHoldMatchSettingCriteria CreateUpdateHoldMatchSettingCriteria(UpdateHoldMatchSettingRequest request, List<HoldSetting> holdSettings)
    {
        var holdInfoRoot = new HoldMatchInfoRoot
        {
            HoldMatchInfoItems = holdSettings.Select(x => new HoldSettingInfo
            {
                Type = x.Type,
                IsApplyChild = x.IsApplyChild,
                Value = x.Value
            }).ToList()
        };

        var criteria = new UpdateHoldMatchSettingCriteria
        {
            MatchId = request.MatchId,
            AdminId = currentSession.UserId,
            Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString(),
            HoldInfo = xmlConvertService.Serialize(holdInfoRoot)
        };

        return criteria;
    }

    public async Task<Result> UpdateTimeSettingLeague(TimeSettingRequest request)
    {
        var criteria = mapper.Map<TimeSettingRequest, UpdateTimeSettingLeagueCriteria>(request);
        criteria.AdminId = currentSession.UserId;

        await repository.ExecuteAsync(criteria);

        return new Result
        {
            ErrCode = criteria.ErrCode,
            ErrMsg = criteria.ErrMsg
        };
    }

    public async Task<string> GetSetting(GetSettingRequest request)
    {
        const int convertToBase = 2;
        var criteria = new GetSettingCriteria
        {
            MatchId = request.MatchId,
            LeagueId = request.LeagueId
        };

        var setting = await repository.GetAsync<int?>(criteria);

        return Convert.ToString(setting ?? 0, convertToBase).Reverse();
    }

    public async Task<LeagueSettings> GetLeagueSettings(GetLeagueSettingsRequest request)
    {
        var criteria = new GetLeagueSettings
        {
            LeagueId = request.LeagueId,
            SportType = request.SportType
        };

        var leagueSettings = await repository.GetAsync<LeagueSettings>(criteria);

        leagueSettings.RefDataService = refDataService;
        leagueSettings.Providers = (await GetProviderInfo(request)).ToList();

        return leagueSettings;
    }

    private async Task<IEnumerable<ProviderInfo>> GetProviderInfo(GetLeagueSettingsRequest request)
    {
        var criteria = new GetProviderInfoCriteria
        {
            SportType = request.SportType,
            LeagueId = request.LeagueId
        };

        return await repository.FetchAsync<ProviderInfo>(criteria);
    }

    private static string GetAutoTypeInfo(int autoType)
    {
        var autoTypeInfo = autoType switch
        {
            (int)AutoSettleType.AutoDirect => "Direct Payout",
            (int)AutoSettleType.AutoPayoutSoccer => "Auto Payout",
            _ => ""
        };
        return autoTypeInfo;
    }
}