namespace Settlement.ResourceName.MapperFactory;

public interface IMapperService
{
    (string, string) GetResourceName(string resourceId, int sportType);
}