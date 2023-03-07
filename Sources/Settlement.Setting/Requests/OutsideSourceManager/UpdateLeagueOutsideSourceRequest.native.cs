using MediatR;
using Settlement.Setting.Models.OutsideSourceManager;
using Settlement.Core.Models;
using System.Collections.Generic;


namespace Settlement.Setting.Requests.OutsideSourceManager;

public class UpdateLeagueOutsideSourceRequest: IRequest<Result>
{
    public int LeagueId { get; set; }

    public List<OutsideSourceResourceItem> Sources { get; set; }
}