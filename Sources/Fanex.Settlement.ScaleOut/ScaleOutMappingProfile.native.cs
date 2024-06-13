namespace Fanex.Settlement.ScaleOut;

public class ScaleOutMappingProfile : Profile
{
    public ScaleOutMappingProfile()
    {
        CreateMap<EventTicketRequest, ValidateEventCriteria>();
        CreateMap<EventTicketRequest, ValidateTicketCriteria>();
        CreateMap<EventTicketFastMarketRequest, ValidationEventFastMarketCriteria>();
        CreateMap<EventTicketFastMarketRequest, ValidationTicketFastMarketCriteria>();
        CreateMap<UpdateMatchInfoRequest, UpdateMatchInfoCriteria>();
        CreateMap<UpdateMatchInfo3RdRequest, UpdateMatchInfo3RdCriteria>();
    }
}