using Newtonsoft.Json;
using Settlement.Services;

namespace Settlement.Gaming.Models.Happy5;

public class LeaguesModel
{
    [JsonIgnore]
    public IRefDataService RefDataService { get; set; }

    public int LeagueId { get; set; }

    public string LeagueName => RefDataService.GetLeagueName(LeagueId);

    public List<MatchDetail> Matches { get; set; }
}