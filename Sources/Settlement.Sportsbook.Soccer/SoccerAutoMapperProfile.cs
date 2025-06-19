using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using CheckingMarkedTicketsCriteria = Settlement.Sportsbook.Soccer.Criteria.CheckingMarkedTicketsCriteria;
using CheckingMarkedTicketsCriteriaWithResources = Settlement.Core.Criteria.CheckingMarkedTicketsCriteria;

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
        CreateMap<CheckingMarkedTicketsRequest, CheckingMarkedTicketsCriteriaWithResources>();
        CreateMap<MoveBetRequest, MoveThirdPartyBetTicketCriteria>();
        CreateMap<Models.MatchDetail, GoalIconQueryModel>();
        CreateMap<UncalculateFtRequest, SettleBaseRequest>();
        CreateMap<RefundCriteria, InsertLogCriteria>();
        CreateMap<XmlResource, ResourceItem>();
    }
}