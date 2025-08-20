namespace Settlement.Sportsbook.Aio.MapperFactory;

public interface IMapperService
{
    Task Decorate(dynamic obj);
}