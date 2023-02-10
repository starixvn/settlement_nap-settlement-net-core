using MediatR;
using Settlement.Setting.Models;
using System.Collections.Generic;

namespace Settlement.Setting.Requests.ProviderManager;

public class GetProviderRequest : IRequest<List<ProviderModel>>
{
    public int GameType { get; set; }
}