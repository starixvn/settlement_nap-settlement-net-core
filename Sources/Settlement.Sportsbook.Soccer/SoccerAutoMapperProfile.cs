using AutoMapper;
using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;

namespace Settlement.Sportsbook.Soccer;

public class SoccerAutoMapperProfile : Profile
{
    public SoccerAutoMapperProfile()
    {
        CreateMap<GetMatchRequest, GetMatchDetailCriteria>();
        CreateMap<GetLatestMatchDetailRequest, GetLatestMatchDetailCriteria>();
        CreateMap<CheckStatusRequest, CheckStatusCriteria>()
            .ForMember(dest => dest.Action, opt => opt.MapFrom(src => src.ActionName));
        CreateMap<SettleRequest, GoalCondition>();
        CreateMap<InstantCalculationRequest, PushInstantCalculationCriteria>();
        CreateMap<InstantCalculationRequest, InstantGoalCondition>();
        CreateMap<RefundRequest, GoalCondition>();
        CreateMap<GetSpecificBetTypeRequest, SpecificBetTypesCriteria>();
        CreateMap<CheckingMarkedTicketsRequest, CheckingMarkedTicketsCriteria>().ForMember(dest => dest.Action, opt => opt.MapFrom(src => src.ActionName));
        CreateMap<MoveBetRequest, MoveThirdPartyBetTicketCriteria>();
        CreateMap<Models.MatchDetail, GoalIconQueryModel>();
        CreateMap<UncalculateFtRequest, SettleBaseRequest>();
    }
}