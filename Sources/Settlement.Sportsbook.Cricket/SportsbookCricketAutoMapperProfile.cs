using AutoMapper;
using Settlement.Sportsbook.Aio.Criterias;
using Settlement.Sportsbook.Cricket.Criterias;
using Settlement.Sportsbook.Cricket.Requests;

namespace Settlement.Sportsbook.Cricket
{
    public class SportsbookCricketAutoMapperProfile : Profile
    {
        public SportsbookCricketAutoMapperProfile()
        {
            CreateMap<GetMatchRequest, GetMatchDetailCriteria>();
            CreateMap<GetMatchRequest, GetResultDetailCriteria>();
            CreateMap<GetRecalResultRequest, GetRecalResultCriteria>();
            CreateMap<CheckMarkedTicketsRequest, CheckMarkedTicketsCriteria>();
            CreateMap<GetMatchRequest, GetHedgeMatchCriteria>();
            CreateMap<CheckMarkedTicketsParlayRequest, CheckMarkedTicketsParlayCriteria>();
            CreateMap<RefundParlayRequest, RefundParlayCriteria>();
            CreateMap<SettleRequest, SettleCriteria>()
                .ForMember(dest => dest.Action, map => map.MapFrom(src => src.ActionName))
                .ForMember(dest => dest.SelectedResources, map => map.Ignore());
            CreateMap<SettleChildMatchRequest, SettleCriteria>()
                .ForMember(dest => dest.Action, map => map.MapFrom(src => src.ActionName))
                .ForMember(dest => dest.SelectedResources, map => map.Ignore())
                .ForMember(dest => dest.MatchId, map => map.Ignore());
            CreateMap<RefundParlayChildMatchRequest, RefundParlayCriteria>()
                .ForMember(dest => dest.MatchId, map => map.Ignore());
        }
    }
}