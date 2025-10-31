using Fanex.Settlement.MessageBridge.JackTime;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Sportsbook.Aio.Criteria;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Requests;

namespace Settlement.Sportsbook.Aio;

public class SportsbookAioAutoMapperProfile : Profile
{
    public SportsbookAioAutoMapperProfile()
    {
        CreateMap<GetMatchRequest, GetMatchDetailCriteria>();
        CreateMap<GetMatchRequest, GetResultDetailCriteria>();
        CreateMap<GetRecalResultRequest, GetRecalResultCriteria>();
        CreateMap<CheckMarkedTicketsRequest, CheckingMarkedTicketsCriteria>();
        CreateMap<GetMatchRequest, GetHedgeMatchCriteria>();
        CreateMap<SettleRequest, SettleCriteria>()
            .ForMember(dest => dest.Action, map => map.MapFrom(src => src.ActionName))
            .ForMember(dest => dest.SelectedResources, map => map.Ignore())
            .ForMember(dest => dest.IsSDTEarly, map => map.MapFrom(src => src.IsSettleDetermined));
        CreateMap<SettleChildMatchRequest, SettleCriteria>()
       .ForMember(dest => dest.Action, map => map.MapFrom(src => src.ActionName))
       .ForMember(dest => dest.SelectedResources, map => map.Ignore())
       .ForMember(dest => dest.MatchId, map => map.Ignore());
        CreateMap<ChildMatchModel, ResourceItem>();
        CreateMap<SettleCriteria, InsertLogCriteria>();
        CreateMap<ResultSettingRequest, ResultSettingCriteria>();
        CreateMap<SettleCriteria, HybridMatch>()
            .ForMember(dest => dest.LogDate, opt => opt.MapFrom(src => DateTime.Now));

    }
}