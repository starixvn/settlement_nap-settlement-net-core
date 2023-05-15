using Settlement.EventManagement.Criteria;
using Settlement.EventManagement.Models.Calculation;
using Settlement.EventManagement.Models.MultiSports;
using Settlement.EventManagement.Requests;
using CalculateMatch = Settlement.EventManagement.Models.Calculation.Match;
using Match = Settlement.EventManagement.Models.MultiSports.Match;

namespace Settlement.EventManagement;

public class EventManagementAutoMapperProfile : Profile
{
    public EventManagementAutoMapperProfile()
    {
        CreateMap<FilterMultiSportRequest, SportsbookCriteria>()
            .ForMember(dest => dest.AutoSetting, map => map.MapFrom(src => src.AutoPayout));
        CreateMap<SportRequest, SportCriteria>();
        CreateMap<LeagueRequest, LeagueCriteria>();
        CreateMap<Match, MultiSportMatchWaiting>();
        CreateMap<CalculateMatch, CalculateMatchWaiting>();
        CreateMap<RefreshMultiSportRequest, GetWaitingMultiSportCriteria>();
        CreateMap<FilterCalculationRequest, GetMatchesCriteria>();
        CreateMap<LeagueCalculationRequest, LeagueCalculationCriteria>();
        CreateMap<RefreshCalculationRequest, GetWaitingCalculationCriteria>();
        CreateMap<FilterAutoCalculationRequest, GetMatchesAutoCalculateCriteria>();
        CreateMap<RefreshCalculationRequest, GetWaitingAutoCalculationCriteria>();
        CreateMap<RefreshAutoCalculationRequest, GetWaitingAutoCalculationCriteria>();
    }
}