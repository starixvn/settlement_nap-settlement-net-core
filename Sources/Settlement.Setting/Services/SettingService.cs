using AutoMapper;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Microsoft.AspNetCore.Http;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Setting.Constants;
using Settlement.Setting.Criteria;
using Settlement.Setting.Models;
using Settlement.Setting.Models.LeagueSettings;
using Settlement.Setting.Requests;
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
}

public class SettingServiceImp : SettingService
{
    private readonly IDynamicRepository repository;

    private readonly INapSession currentSession;

    private readonly IHttpContextAccessor accessor;

    private readonly IMapper mapper;
    private readonly LogService logService;
    private readonly XmlConvertService xmlConvertService;

    private const int holdMatchActionId = 81049;

    public SettingServiceImp(
        IDynamicRepository repository,
        INapSession currentSession,
        IHttpContextAccessor accessor,
        IMapper mapper,
        LogService logService,
        XmlConvertService xmlConvertService)
    {
        this.repository = repository;
        this.currentSession = currentSession;
        this.accessor = accessor;
        this.mapper = mapper;
        this.logService = logService;
        this.xmlConvertService = xmlConvertService;
    }

    public async Task<Result> UpdateSettingLeague(SettingLeagueRequest query)
    {
        var criteria = mapper.Map<SettingLeagueRequest, UpdateSettingLeagueCriteria>(query);
        criteria.AdminId = currentSession.UserId;
        criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
        await repository.ExecuteAsync(criteria);

        return new Result
        {
            ErrCode = criteria.ErrCode,
            ErrMsg = criteria.ErrMsg,
            ChildMatchIds = criteria.UpdatedMatchIds
        };
    }

    public async Task<Result> UpdateSettingMatch(SettingMatchRequest query)
    {
        var criteria = mapper.Map<SettingMatchRequest, UpdateSettingMatchCriteria>(query);
        criteria.AdminId = currentSession.UserId;
        criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
        await repository.ExecuteAsync(criteria);

        return new Result
        {
            ErrCode = criteria.ErrCode,
            ErrMsg = criteria.ErrMsg
        };
    }

    public async Task<RemarkQueryModel> GetRemarkInfo(int matchId)
    {
        var criteria = new GetRemarkInfoCriteria { MatchId = matchId };
        return await repository.GetAsync<RemarkQueryModel>(criteria);
    }

    public async Task ProcessUpdateHoldMatchSetting(UpdateHoldMatchSettingRequest request)
    {
        var changedSettings = request.HoldSettings.Except(request.OrgHoldSettings).ToList();

        if (changedSettings.Count == 0) return;

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
            UserId = currentSession.UserId,
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
        var changedChildMatchSettings = changedSettings.Where(x => x.IsApplyChild);
        if (changedChildMatchSettings.Any() && !string.IsNullOrEmpty(childMatches))
        {
            var childMatch = JsonSerializer.Deserialize<List<ChildMatchRemark>>(childMatches);

            return childMatch.Select(x =>
            {
                var changedNames = string.Join(",", changedChildMatchSettings.Select(setting => setting.Description));
                var parentMatchRemark = $"parent({x.ParentMatchId})";

                return new RemarkLog
                {
                    MatchId = x.MatchId,
                    Remark = $"{changedNames} {parentMatchRemark}"
                };
            }).ToList();
        }

        return new List<RemarkLog>();
    }

    private async Task<string> UpdateHoldMatchSetting(UpdateHoldMatchSettingCriteria criteria)
    {
        await repository.ExecuteAsync(criteria);

        return criteria.ChildMatchList;
    }

    private string GenerateChildMatchRemark(List<HoldSetting> changedSettings, string childMatches)
    {
        if (!changedSettings.Any(x => x.Type == HoldPosition.IsUndecided
            || x.Type == HoldPosition.IsMtdHold))
        {
            return string.Empty;
        }

        if (changedSettings.All(x => !x.IsApplyChild))
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
                Value = x.Value,
            }).ToList(),
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
}