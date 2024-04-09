using MediatR;

namespace Settlement.Setting.Requests.ProviderManager;

using Models.ProviderManager;
using Settlement.Core.Models;

public class GetProviderRequest : IRequest<List<ProviderModel>>
{
    public int GameType { get; set; }
}