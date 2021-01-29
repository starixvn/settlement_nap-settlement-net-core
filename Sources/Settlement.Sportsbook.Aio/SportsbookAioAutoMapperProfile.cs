using AutoMapper;
using Settlement.Sportsbook.Aio.Criterias;
using Settlement.Sportsbook.Aio.Requests;

namespace Settlement.Sportsbook.Aio
{
    public class SportsbookAioAutoMapperProfile : Profile
    {
        public SportsbookAioAutoMapperProfile()
        {
            CreateMap<GetMatchRequest, GetMatchDetailCriteria>();
            CreateMap<GetMatchRequest, GetResultDetailCriteria>();
            CreateMap<GetRecalResultRequest, GetRecalResultCriteria>();
            CreateMap<CheckMarkedTicketsRequest, CheckMarkedTicketsCriteria>();
            CreateMap<SettleRequest, SettleCriteria>()
                .ForMember(dest => dest.Action, map => map.MapFrom(src => src.ActionName))
                .ForMember(dest => dest.SelectedResources, map => map.Ignore());
        }
    }
}
