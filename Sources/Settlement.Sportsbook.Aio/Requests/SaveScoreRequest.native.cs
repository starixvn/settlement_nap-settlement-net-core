using MediatR;
using Settlement.Core.Models;
using Settlement.Sportsbook.Aio.Models;
using System.Collections.Generic;

namespace Settlement.Sportsbook.Aio.Requests
{
    public class SaveScoreRequest: IRequest<Result>
    {
        public int MatchId { get; set; }

        public List<SaveScoreModel> ScoresToSave { get; set; }

        public List<SaveScoreModel> CheckedScores { get; set; }

        public int UserId { get; set; }

        public string OutsideSources { get; set; }

        public string Sources { get; set; }

        public string Ip { get; set; }

        public string ApiKey { get; set; }

        public bool IsTrader { get; set; }
    }
}
