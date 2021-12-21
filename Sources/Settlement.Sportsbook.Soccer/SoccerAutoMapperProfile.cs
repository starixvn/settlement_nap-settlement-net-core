using AutoMapper;
using Settlement.Sportsbook.Soccer.Criterias;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;

namespace Settlement.Sportsbook.Soccer
{
    public class SoccerAutoMapperProfile : Profile
    {
        public SoccerAutoMapperProfile()
        {
            CreateMap<GetMatchRequest, GetMatchDetailCriteria>();
            CreateMap<GetLastestMatchDetailRequest, GetLastestMatchDetailCriteria>();
            CreateMap<SettleRequest, CalculateCriteria>()
                .ForSourceMember(source => source.FinalAwayScore, opt => opt.DoNotValidate())
                .ForSourceMember(source => source.FinalHomeScore, opt => opt.DoNotValidate())
                .ForSourceMember(source => source.HalfTimeAwayScore, opt => opt.DoNotValidate())
                .ForSourceMember(source => source.HalfTimeHomeScore, opt => opt.DoNotValidate())
                .ForMember(dest => dest.Action, opt => opt.MapFrom(src => src.ActionName));
            CreateMap<CheckStatusRequest, CheckStatusCriteria>()
                .ForMember(dest => dest.Action, opt => opt.MapFrom(src => src.ActionName));
            CreateMap<SettleRequest, GoalCondition>();
            CreateMap<InstantCalculationRequest, PushInstantCalculationCriteria>();
        }
    }
}