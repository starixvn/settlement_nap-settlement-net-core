using Fanex.RemotingRef;

namespace Settlement.Services;

public interface IRefDataService
{
    string GetTeamName(object teamId);

    string GetSportName(int sportId);

    string GetLeagueName(object leagueId);

    string GetBetTypeName(object betTypeId);

    string GetBetTypeName(object betTypeId, object resourceId);
}

public class RefDataService(IRemotingRefService remotingRefService) : IRefDataService
{
    private const string LanguageCode = "en";

    public string GetTeamName(object teamId)
    {
        return remotingRefService.GetTeamName(teamId.ToString(), LanguageCode, string.Empty);
    }

    public string GetSportName(int sportId)
    {
        return remotingRefService.GetSportName(sportId.ToString(), LanguageCode, string.Empty);
    }

    public string GetLeagueName(object leagueId)
    {
        return remotingRefService.GetLeagueName(leagueId.ToString(), LanguageCode, string.Empty);
    }

    public string GetBetTypeName(object betTypeId)
    {
        return remotingRefService.GetBetTypeName(betTypeId.ToString(), LanguageCode);
    }

    public string GetBetTypeName(object betTypeId, object resourceId)
    {
        return remotingRefService.GetBetTypeName(betTypeId.ToString(), LanguageCode, string.Empty, resourceId.ToString());
    }
}