using AutoMapper;
using Settlement.Setting.Models.Notification;
using Settlement.ThirdPartyProducts.Criteria;
using Settlement.ThirdPartyProducts.Requests;

namespace Settlement.ThirdPartyProducts
{
    public class ThirdPartyProductsAutoMapperProfile : Profile
    {
        public ThirdPartyProductsAutoMapperProfile()
        {
            CreateMap<LeaguesRequest, LeaguesCriteria>();
            CreateMap<FilterRequest, MatchesCriteria>();
            CreateMap<SportRequest, SportCriteria>();
            CreateMap<MatchesWaitingRequest, MatchesWaitingCriteria>();
            CreateMap<MatchInfoRequest, MatchInfoCriteria>();
            CreateMap<VoidBetRequest, NotificationModel>();
        }
    }
}