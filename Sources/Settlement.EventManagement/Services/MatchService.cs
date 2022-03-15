using System.Collections.Generic;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Match = Settlement.EventManagement.Models.Match;

namespace Settlement.EventManagement.Services
{
    public interface IMatchService
    {
        List<Match> GetScoreForMatchBySportType(List<Match> matches, List<ResultDetail> resultDetails, int sportType, int groupSport, Permission permission = null);
    }

    public class MatchServiceImp : IMatchService
    {
        private readonly IMatchResultDetailService matchResultDetailService;

        private readonly IRefDataService refDataService;

        public MatchServiceImp(IRefDataService refDataService,
            IMatchResultDetailService matchResultDetailService)
        {
            this.matchResultDetailService = matchResultDetailService;
            this.refDataService = refDataService;
        }

        public List<Match> GetScoreForMatchBySportType(List<Match> matches, List<ResultDetail> resultDetails, int sportType, int groupSport, Permission permission = null)
        {
            if (sportType == SportType.Tennis)
            {
                return matchResultDetailService.TennisResultDetail(matches, resultDetails, permission);
            }

            if (sportType == SportType.BasketBall)
            {
                return matchResultDetailService.BasketballResultDetail(matches, resultDetails, permission);
            }

            if (sportType == SportType.ESports)
            {
                return matchResultDetailService.ESportsResultDetail(matches, resultDetails, permission);
            }

            if (sportType == SportType.Badminton)
            {
                return matchResultDetailService.BadmintonResultDetail(matches, resultDetails, permission);
            }

            if (sportType == SportType.Cricket)
            {
                return matchResultDetailService.CricketResultDetail(matches, resultDetails, permission);
            }

            if (sportType == SportType.BeachVolleyball)
            {
                return matchResultDetailService.BeachVolleyballResultDetail(matches, resultDetails);
            }

            if (sportType == SportType.VolleyBall)
            {
                return matchResultDetailService.VolleyballResultDetail(matches, resultDetails);
            }

            foreach (var result in matches)
            {
                result.RefDataService = refDataService;
                result.GroupSport = groupSport;
            }

            return LoadExternalResults(matches, resultDetails, sportType);
        }

        private readonly List<int> fullTimeSports = new List<int>
        {
            SportType.IceHockey,
            SportType.VolleyBall,
            SportType.TableTennis,
            SportType.Handball,
            SportType.Dart,
            SportType.Swimming,
            SportType.Politics,
            SportType.WaterPolo,
            SportType.Diving,
            SportType.Boxing,
            SportType.Archery,
            SportType.Weightlifting,
            SportType.Canoeing,
            SportType.Gymnastics,
            SportType.Athletics,
            SportType.Equestrian,
            SportType.Entertainment,
            SportType.OtherSports,
            SportType.Kabaddi,
            SportType.Futsal,
            SportType.UpcomingSport56,
            SportType.Billard,
            SportType.Golf,
            SportType.Motorsports,
            SportType.Winter,
            SportType.Cycling,
            SportType.Fencing,
            SportType.Judo,
            SportType.ModernPentathlon,
            SportType.Rowing,
            SportType.Sailing,
            SportType.Shooting,
            SportType.Taekwondo,
            SportType.Triathlon,
            SportType.Wrestling,
            SportType.MuayThai,
            SportType.BeachSoccer,
            SportType.Poker,
            SportType.Chess,
            SportType.Olympic,
            SportType.Finance,
            SportType.FieldHockey,
            SportType.Squash,
            SportType.SepakTakraw,
        };

        private readonly List<int> halfTimeFullTimeSports = new List<int>
        {
            SportType.Football,
            SportType.BaseBall,
            SportType.Rugby,
            SportType.NetBall
        };

        private List<Match> LoadExternalResults(List<Match> matches, List<ResultDetail> resultDetails, int sportType)
        {
            if (fullTimeSports.Contains(sportType))
            {
                return matchResultDetailService.OtherSportsResultDetail(matches, resultDetails, false);
            }

            return halfTimeFullTimeSports.Contains(sportType) ? matchResultDetailService.OtherSportsResultDetail(matches, resultDetails, true) : matches;
        }
    }
}