using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Fanex.Data.Repository;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.EventManagement.Criteria;
using Settlement.EventManagement.Models;
using Settlement.EventManagement.Requests;

namespace Settlement.EventManagement.Services
{
    public interface GetDataFilterService
    {
        Task<List<Sport>> GetSports(SportRequest request);

        Task<List<LeagueTypeModel>> GetLeagues(LeagueRequest request);
    }

    public class GetDataFilterServiceImp : GetDataFilterService
    {
        private static readonly List<int> PopularSport = new List<int> { SportType.Badminton, SportType.BasketBall, SportType.ESports, SportType.Tennis };
        private const string PopularGroup = "All Popular Sports";
        private const string OtherGroup = "All Other Sports";

        private readonly IMapper mapper;

        private readonly IDynamicRepository repository;

        private readonly IRefDataService refDataService;

        public GetDataFilterServiceImp(IMapper mapper,
            IDynamicRepository repository,
            IRefDataService refDataService)
        {
            this.repository = repository;
            this.refDataService = refDataService;
            this.mapper = mapper;
        }

        public async Task<List<Sport>> GetSports(SportRequest request)
        {
            var criteria = mapper.Map<SportRequest, SportCriteria>(request);
            var sports = (await repository.FetchAsync<Sport>(criteria)).ToList();
            sports.ForEach(x => x.SportName = refDataService.GetSportName(x.SportType));

            return OrderSport(sports.OrderBy(item => item.SportName).ToList());
        }

        public async Task<List<LeagueTypeModel>> GetLeagues(LeagueRequest request)
        {
            var criteria = mapper.Map<LeagueRequest, LeagueCriteria>(request);
            var leagues = (await repository.FetchAsync<LeagueTypeModel>(criteria)).ToList();
            foreach (var item in leagues)
            {
                item.SportName = refDataService.GetSportName(item.SportType);
                item.LeagueName = refDataService.GetLeagueName(item.LeagueId);
                item.Group = $"All {item.SportName} Leagues";
            }

            return SortLeague(leagues.ToList());
        }

        private static List<Sport> OrderSport(List<Sport> sports)
        {
            var list = new List<Sport>();
            var otherGroup = new List<Sport>();
            var otherSport = new List<Sport>();

            sports.ForEach(item =>
            {
                if (PopularSport.IndexOf(item.SportType) > -1)
                {
                    item.Group = PopularGroup;
                    list.Add(item);
                }
                else
                {
                    item.Group = OtherGroup;
                    if (item.SportType == SportType.OtherSports)
                    {
                        otherSport.Add(item);
                    }
                    else
                    {
                        otherGroup.Add(item);
                    }
                }
            });

            list.AddRange(otherGroup);
            list.AddRange(otherSport);

            return list;
        }

        private static List<LeagueTypeModel> SortLeague(List<LeagueTypeModel> leagues)
        {
            var popularGroup = new List<LeagueTypeModel>();
            var otherGroup = new List<LeagueTypeModel>();
            var otherSport = new List<LeagueTypeModel>();
            leagues.ForEach(item =>
            {
                if (PopularSport.IndexOf(item.SportType) > -1)
                {
                    popularGroup.Add(item);
                }
                else
                {
                    if (item.SportType == SportType.OtherSports)
                    {
                        otherSport.Add(item);
                    }
                    else
                    {
                        otherGroup.Add(item);
                    }
                }
            });

            var list = popularGroup.OrderBy(item => item.SportName).ThenBy(item => item.LeagueName).ToList();
            list.AddRange(otherGroup.OrderBy(item => item.SportName).ThenBy(item => item.LeagueName).ToList());
            list.AddRange(otherSport.OrderBy(item => item.LeagueName).ToList());

            return list;
        }
    }
}