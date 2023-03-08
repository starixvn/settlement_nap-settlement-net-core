using Newtonsoft.Json;
using Settlement.Core.Services;

namespace Settlement.ThirdPartyProducts.Models;

public class LeagueModel
{
    [JsonIgnore]
    public IRefDataService RefDataService { get; set; }

    public int LeagueId { get; set; }

    public int SportType { get; set; }

    public string SportName => RefDataService.GetSportName(SportType);

    public string LeagueName => RefDataService.GetLeagueName(LeagueId);

    public bool IsAutoSettingForLeague { get; set; }

    public List<MatchDetailModel> Matches { get; set; }
}