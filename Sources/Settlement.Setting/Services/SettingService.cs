using System;
using System.Text.Json;
using AutoMapper;
using Azure.Core;
using Fanex.Data.Repository;
using Fanex.Logging;
using Fanex.NAP.Client.Helpers.Web;
using MediatR;
using Microsoft.AspNetCore.Http;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Setting.Constants;
using Settlement.Setting.Criteria;
using Settlement.Setting.Models;
using Settlement.Setting.Requests;
using LogService = Settlement.Core.Services.LogService;

namespace Settlement.Setting.Services;

public interface SettingService
{
    Task<Result> UpdateSettingLeague(SettingLeagueRequest query);

    Task<Result> UpdateSettingMatch(SettingMatchRequest query);

    Task<RemarkQueryModel> GetRemarkInfo(int matchId);

    Task UpdateRemarkSetting(UpdateRemarkRequest request);

    Task<Result> UpdateTimeSettingLeague(TimeSettingRequest request);

    Task<string> GetSetting(GetSettingRequest request);

    Task<string> ProcessUpdateHoldMatchSetting(UpdateHoldMatchSettingRequest request);

    Dictionary<string, bool> DetectDiffProperties(Remark remark, Remark otherRemark);
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

    public async Task UpdateRemarkSetting(UpdateRemarkRequest request)
    {
        var criteria = mapper.Map<UpdateRemarkRequest, UpdateRemarkCriteria>(request);
        criteria.AdminId = currentSession.UserId;
        await repository.ExecuteAsync(criteria);
    }

    public async Task<string> ProcessUpdateHoldMatchSetting(UpdateHoldMatchSettingRequest request)
    {
        var diffRemark = DetectDiffProperties(request.OrgRemark, request.Remark);

        if (!request.IsApplyChild && diffRemark.Count == 0) return string.Empty;

        var holdSettingInfo = CreateHoldMatchInfoItems(request, diffRemark);

        var criteria = CreateUpdateHoldMatchSettingCriteria(request, holdSettingInfo);
        var childMatches = await UpdateHoldMatchSetting(criteria);

        WriteLogUpdateHoldSetting(request, holdSettingInfo, childMatches);

        return childMatches;
    }

    private List<HoldMatchInfoItem> CreateHoldMatchInfoItems(UpdateHoldMatchSettingRequest request, Dictionary<string, bool> diffRemark)
    {
        var holdSettingInfo = diffRemark.Select(x => new HoldMatchInfoItem
        {
            Type = GetRemarkType(x.Key),
            Value = x.Value,
            IsApplyChild = x.Key == nameof(Remark.IsMtdHold) && request.IsApplyChild
        }).ToList();

        var mtdHold = holdSettingInfo.Find(x => x.Type == RemarkType.IsMtdHold);

        if (mtdHold is null && request.IsApplyChild)
        {
            holdSettingInfo.Add(new HoldMatchInfoItem
            {
                Type = RemarkType.IsMtdHold,
                Value = request.Remark.IsMtdHold,
                IsApplyChild = request.IsApplyChild
            });
        }

        return holdSettingInfo;
    }

    private void WriteLogUpdateHoldSetting(UpdateHoldMatchSettingRequest request, List<HoldMatchInfoItem> holdMatchInfo, string childMatches)
    {
        var remarkLogs = CreateRemarkLogs(request, holdMatchInfo, childMatches);

        var logCriteria = new LogCriteria
        {
            MatchId = request.MatchId,
            RemarkJson = JsonSerializer.Serialize(remarkLogs),
            ActionId = holdMatchActionId,
            UserId = currentSession.UserId,
        };
        logService.WriteLog(logCriteria);
    }

    private List<RemarkLog> CreateRemarkLogs(UpdateHoldMatchSettingRequest request, List<HoldMatchInfoItem> holdMatchInfo, string childMatches)
    {
        var remarkChanged = holdMatchInfo.Select(x => $"{GetHoldName(x.Type)}({(x.Value ? "yes" : "no")})").ToList();

        var childInfo = CreateChildInfo(request.IsApplyChild, childMatches);

        var parentRemark = remarkChanged.Count > 0 ? string.Join(", ", remarkChanged) : string.Empty;
        var remarkLogs = new List<RemarkLog>
        {
            new ()
            {
                MatchId = request.MatchId,
                Remark = $"{parentRemark} child({childInfo})"
            }
        };

        if (request.IsApplyChild && !string.IsNullOrEmpty(childMatches))
        {
            var childMatchIds = childMatches.Split(",").Select(x => x.Trim()).Select(x => int.Parse(x));
            var mtdHoldChanged = remarkChanged.Find(x => x.Contains("Mtd. Hold")) ?? string.Empty;
            var childRemarkLogs = childMatchIds.Select(x => new RemarkLog
            {
                MatchId = x,
                Remark = mtdHoldChanged + " parent({parent})"
            });

            remarkLogs.AddRange(childRemarkLogs);
        }

        return remarkLogs;
    }

    private async Task<string> UpdateHoldMatchSetting(UpdateHoldMatchSettingCriteria criteria)
    {
        await repository.ExecuteAsync(criteria);

        return criteria.ChildMatchList;
    }

    private string CreateChildInfo(bool isApplyChild, string childMatchesUpdated)
    {
        if (!isApplyChild)
        {
            return "off";
        }

        return string.IsNullOrEmpty(childMatchesUpdated) ? "0" : childMatchesUpdated;
    }

    private string GetHoldName(int remarkType) => remarkType switch
    {
        RemarkType.IsMtdHold => "Mtd. Hold",
        RemarkType.IsUndecided => "Undecided",
        RemarkType.IsPending => "Result Pending",
        RemarkType.IsUnderSettle => "Under Settlement",
        RemarkType.IsKeyHold => "Hold Key",
        _ => string.Empty,
    };

    private short GetRemarkType(string key) => key switch
    {
        nameof(Remark.IsMtdHold) => 16,
        nameof(Remark.IsUndecided) => 2,
        nameof(Remark.IsPending) => 1,
        nameof(Remark.IsUnderSettle) => 4,
        nameof(Remark.IsKeyHold) => 64,
        _ => -1
    };

    public Dictionary<string, bool> DetectDiffProperties(Remark remark, Remark otherRemark)
    {
        var differentProperties = new Dictionary<string, bool>();
        var properties = typeof(Remark).GetProperties();
        foreach (var property in properties)
        {
            var valueOne = (bool)property.GetValue(remark);
            var valueTwo = (bool)property.GetValue(otherRemark);

            var fieldName = property.Name;

            if (valueOne != valueTwo)
            {
                differentProperties.Add(fieldName, valueTwo);
            }
        }

        return differentProperties;
    }

    private UpdateHoldMatchSettingCriteria CreateUpdateHoldMatchSettingCriteria(UpdateHoldMatchSettingRequest request, List<HoldMatchInfoItem> holdInfos)
    {
        var criteria = new UpdateHoldMatchSettingCriteria { MatchId = request.MatchId };
        criteria.AdminId = currentSession.UserId;
        criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();

        var holdInfoRoot = new HoldMatchInfoRoot
        {
            HoldMatchInfoItems = holdInfos,
        };

        criteria.HoldInfo = xmlConvertService.Serialize(holdInfoRoot);

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