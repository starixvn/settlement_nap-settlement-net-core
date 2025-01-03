namespace Settlement.Setting.Requests.ProviderManager;

using Models.ProviderManager;

public class GetProviderRequest : IRequest<List<ProviderModel>>
{
    public int GameType { get; set; }
}