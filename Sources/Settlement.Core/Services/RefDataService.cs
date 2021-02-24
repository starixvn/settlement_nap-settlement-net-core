using Fanex.RemotingRef;

namespace Settlement.Core.Services
{
    public interface IRefDataService
    {
        string GetTeamName(object teamId);

        string GetSportName(int sportId);

        string GetLeagueName(object leagueId);

        string GetBetTypeName(object bettypeId);

        string GetBetTypeName(object bettypeId, object resourceId);

        string GetResourceDataByRefIdAndResourceId(object resourceId);
    }

    public class RefDataService : IRefDataService
    {
        private const string LanguageCode = "en";

        private const string MetricGaming = "SuperLive";

        private readonly IRemotingRefService remotingRefService;

        public RefDataService(IRemotingRefService remotingRefService)
        {
            this.remotingRefService = remotingRefService;
        }

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

        public string GetBetTypeName(object bettypeId)
        {
            return remotingRefService.GetBetTypeName(bettypeId.ToString(), LanguageCode);
        }

        public string GetBetTypeName(object bettypeId, object resourceId)
        {
            return remotingRefService.GetBetTypeName(bettypeId.ToString(), LanguageCode, string.Empty, resourceId.ToString());
        }

        public string GetResourceDataByRefIdAndResourceId(object resourceId)
        {
            return remotingRefService.GetResourceDataByRefIdAndResourceId(MetricGaming, resourceId.ToString(), LanguageCode, string.Empty);
        }
    }
}