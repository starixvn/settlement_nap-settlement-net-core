using AutoMapper;
using Settlement.EventManagement.Criteria;
using Settlement.EventManagement.Models;
using Settlement.EventManagement.Requests;

namespace Settlement.EventManagement
{
    public class EventManagementAutoMapperProfile : Profile
    {
        public EventManagementAutoMapperProfile()
        {
            CreateMap<FilterMultiSportRequest, SportsbookCriteria>()
                .ForMember(dest => dest.AutoSetting, map => map.MapFrom(src => src.AutoPayout));
            CreateMap<SportRequest, SportCriteria>();
            CreateMap<LeagueRequest, LeagueCriteria>();
            CreateMap<Match, MultiSportMatchWaiting>();
            CreateMap<Match, MultiSportMatch>();
            CreateMap<RefreshMultiSportRequest, GetWaitingMultiSportCriteria>();
            CreateMap<CalculateParlayRequest, ParlayCriteria>();
            CreateMap<FilterCalculationRequest, GetMatchesCriteria>();
            CreateMap<LeagueCalculationRequest, LeagueCalculationCriteria>();
            CreateMap<RefreshCalculationRequest, GetWaitingCalculationCriteria>();
            CreateMap<FilterAutoCalculationRequest, GetMatchesAutoCalculateCriteria>();
        }
    }
}