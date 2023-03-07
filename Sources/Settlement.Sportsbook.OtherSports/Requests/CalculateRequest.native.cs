using System.Collections.Generic;
using MediatR;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.OtherSports.Requests;

public class CalculateRequest : IRequest<Result>
{
    public int MatchId { get; set; }

    public int SportType { get; set; }

    public int? FinalHomeScore { get; set; }

    public int? FinalAwayScore { get; set; }

    public int? HalfTimeHomeScore { get; set; }

    public int? HalfTimeAwayScore { get; set; }

    public string BetStatus { get; set; }

    public string Action { get; set; }

    public bool IsReSettledTickets { get; set; }

    public int? RefResultStatus { get; set; }

    public List<ResourceItem> SelectedResources { get; set; }

    public bool IsScoreDirect { get; set; }

    public int HedgeMatchId { get; set; }
}