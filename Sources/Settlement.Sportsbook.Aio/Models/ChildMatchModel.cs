using System;
using System.Globalization;
using System.Linq;
using Kaden.Extensions;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Aio.Constants;

namespace Settlement.Sportsbook.Aio.Models
{
    public class ChildMatchModel
    {
        private const int ToBase = 2;

        private string leagueName;

        private string relatedResourceId;

        private readonly string defaultValue = "";

        private string eventStatus;

        public string MatchCode { get; set; }

        public int MatchId { get; set; }

        public string ResourceId { get; set; }

        public string EventStatus
        {
            get => CultureInfo.CurrentCulture.TextInfo.ToTitleCase(eventStatus.ToLowerInvariant());
            set => eventStatus = value;
        }

        public string BetStatus { get; set; }

        public string HomeValue { get; set; }

        public string AwayValue { get; set; }

        public int ChildMatchType { get; set; }

        public int ResultStatusId { get; set; }

        public byte SettlementStatus { get; set; }

        public byte ResultSetting { get; set; }

        public byte ConfirmFT { get; set; }

        public string LeagueName => ChildMatchConstant.LeagueName.TryGetValue(ChildMatchType, out leagueName) ? leagueName : defaultValue;

        public string RelatedResourceId => ChildMatchConstant.ResourceRelated.TryGetValue(ChildMatchType, out relatedResourceId) ? relatedResourceId : defaultValue;

        public MatchResultSetting ResultSettingData => new MatchResultSetting
        {
            ResultSetting = Convert.ToString(ResultSetting, ToBase).Reverse(),
        };

        public RemarkSettingModel Remark => new RemarkSettingModel(SettlementStatus);

        public bool IsHold
        {
            get
            {
                bool[] settingMatch =
                {
                    Remark.IsKeyHold, Remark.IsMtdHold, Remark.IsPending, Remark.IsUndecided,
                    Remark.IsUnderSettle
                };
                return settingMatch.Any(item => item);
            }
        }
    }
}