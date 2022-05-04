using AutoMapper;
using Settlement.ThirdPartyProducts.Criteria;
using Settlement.ThirdPartyProducts.Requests;

namespace Settlement.ThirdPartyProducts
{
    public class BetBuilderAutoMapper : Profile
    {
        public BetBuilderAutoMapper()
        {
            CreateMap<LeaguesRequest, LeaguesCriteria>();
            CreateMap<FilterRequest, MatchesCriteria>();
            CreateMap<SportRequest, SportCriteria>();
            CreateMap<MatchesWaitingRequest, MatchesWaitingCriteria>();
            CreateMap<MatchInfoRequest, MatchInfoCriteria>();
        }
    }
}