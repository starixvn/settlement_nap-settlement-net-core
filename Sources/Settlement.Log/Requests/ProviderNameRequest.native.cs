using MediatR;
using Settlement.Log.Models;

namespace Settlement.Log.Requests;

public class ProviderNameRequest : IRequest<List<ProviderName>>
{
}