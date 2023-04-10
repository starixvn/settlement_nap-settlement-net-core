using MediatR;
using Settlement.Setting.Models.OutsideSourceManager;

namespace Settlement.Setting.Requests.OutsideSourceManager;

public class GetOutsideSourceRequest : IRequest<List<OutsideSourceModel>>
{
    public string GameTypes { get; set; }

    public string SourceName { get; set; }

    public int SourceStatus { get; set; }

    public int SourceType { get; } = 1;

    public int SportType { get; set; }
}