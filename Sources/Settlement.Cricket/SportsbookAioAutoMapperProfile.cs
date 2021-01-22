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
            CreateMap<GetMatchRequest, GetRecalMatchCriteria>();
            CreateMap<SettleRequest, SettleCriteria>();
        }
    }
}
