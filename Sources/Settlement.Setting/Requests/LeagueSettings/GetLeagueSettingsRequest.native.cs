using MediatR;


namespace Settlement.Setting.Requests.LeagueSettings;
public class GetLeagueSettingsRequest : IRequest<Models.LeagueSettings.LeagueSettings>
{
    public int LeagueId { get; set; }

    public int SportType { get; set; }


}
