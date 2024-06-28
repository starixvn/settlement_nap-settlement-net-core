using AutoMapper;
using Fanex.Data.Repository;
using Settlement.Models;
using Settlement.Services;
using Settlement.Setting.Criteria.OutsideSourceManager;
using Settlement.Setting.Models.OutsideSourceManager;
using Settlement.Setting.Requests.OutsideSourceManager;

namespace Settlement.Setting.Services;

public interface OutsideSourceSettingService
{
    Task<List<OutsideSourceModel>> GetOutsideSource(GetOutsideSourceRequest query);

    Task<LeagueOutsideSourceModel> GetLeagueOutsideSource(GetLeagueOutsideSourceRequest query);

    Task<AddSourceResult> AddOutsideSource(AddOutsideSourceRequest query);

    Task<Result> UpdateOutsideSource(UpdateOutsideSourceRequest query);

    Task<Result> UpdateLeagueOutsideSource(UpdateLeagueOutsideSourceRequest query);
}

public class OutsideSourceSettingServiceImp(
    IDynamicRepository repository,
    XmlConvertService xmlConvertService,
    IRefDataService refDataService,
    IMapper mapper)
    : OutsideSourceSettingService
{
    public async Task<List<OutsideSourceModel>> GetOutsideSource(GetOutsideSourceRequest query)
    {
        var criteria = mapper.Map<GetOutsideSourceRequest, GetOutsideSourceCriteria>(query);

        var sources = await repository.FetchAsync<QueryResultModel>(criteria);

        return sources.GroupBy(source => new { source.SourceId, source.SourceName, source.Remark, source.SourceStatus, source.SportType })
                      .Select(games => new OutsideSourceModel
                      {
                          SourceId = games.Key.SourceId,
                          SourceName = games.Key.SourceName,
                          Remark = games.Key.Remark,
                          SourceStatus = games.Key.SourceStatus,
                          Games = GroupGames(games),
                          SportType = query.SportType,
                          SportName = refDataService.GetSportName(query.SportType)
                      }).ToList();
    }

    private static List<GameModel> GroupGames(IEnumerable<QueryResultModel> games)
    {
        return games.Select(game => new GameModel { GameType = game.GameType, IsActive = game.IsActive }).ToList();
    }

    public async Task<LeagueOutsideSourceModel> GetLeagueOutsideSource(GetLeagueOutsideSourceRequest query)
    {
        var criteria = mapper.Map<GetLeagueOutsideSourceRequest, GetLeagueOutsideSourceCriteria>(query);
        var (FirstResultSet, SecondResultSet) = await repository.FetchMultipleAsync<LeagueOutSideSourceResourceItem, LeagueOutSideSourceResourceItem>(criteria);

        return new LeagueOutsideSourceModel
        {
            OutsideSourceList = FirstResultSet.OrderBy(item => item.PGid).ToList(),
            OutsideSourceSort = SecondResultSet.ToList()
        };
    }

    public async Task<AddSourceResult> AddOutsideSource(AddOutsideSourceRequest query)
    {
        var resources = CreateGameResources(query.Games);
        var criteria = mapper.Map<AddOutsideSourceRequest, AddOutsideSourceCriteria>(query);
        criteria.GameTypes = resources;

        await repository.ExecuteAsync(criteria);
        return new AddSourceResult
        {
            ErrCode = criteria.ErrCode,
            ErrMsg = criteria.ErrMsg,
            SourceId = criteria.NewSourceId
        };
    }

    public async Task<Result> UpdateOutsideSource(UpdateOutsideSourceRequest query)
    {
        var resources = CreateGameResources(query.Games);
        var criteria = mapper.Map<UpdateOutsideSourceRequest, UpdateOutsideSourceCriteria>(query);
        criteria.GameTypes = resources;

        await repository.ExecuteAsync(criteria);
        return new Result
        {
            ErrCode = criteria.ErrCode,
            ErrMsg = criteria.ErrMsg
        };
    }

    private string CreateGameResources(List<GameModel> selectedResources)
    {
        var resources = new GameResources<GameModel>
        {
            GameItems = selectedResources
        };

        return xmlConvertService.Serialize(resources);
    }

    public async Task<Result> UpdateLeagueOutsideSource(UpdateLeagueOutsideSourceRequest query)
    {
        var resources = CreateResources(query.Sources);
        var criteria = mapper.Map<UpdateLeagueOutsideSourceRequest, UpdateLeagueOutsideSourceCriteria>(query);
        criteria.PgIdSources = resources;

        await repository.ExecuteAsync(criteria);
        return new Result
        {
            ErrCode = criteria.ErrCode,
            ErrMsg = criteria.ErrMsg
        };
    }

    private string CreateResources(List<OutsideSourceResourceItem> selectedResources)
    {
        var resources = new OutsideSourceResources<OutsideSourceResourceItem>
        {
            Items = selectedResources
        };

        return xmlConvertService.Serialize(resources);
    }
}