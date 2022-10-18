using System;
using System.Text.RegularExpressions;

namespace Settlement.Log.Models
{
    public class LogDetailsModels
    {
        private string goalRecord = string.Empty;

        private string remark = string.Empty;

        public DateTime SettlementDate { get; set; }

        public string UserName { get; set; }

        public int ActionId { get; set; }

        public string Action { get; set; }

        public int SportType { get; set; }

        public int? HalfTimeHomeScore { get; set; }

        public int? HalfTimeAwayScore { get; set; }

        public int? FinalHomeScore { get; set; }

        public int? FinalAwayScore { get; set; }

        public string GoalRecord
        {
            get
            {
                const int count = 31;
                return string.IsNullOrEmpty(goalRecord) ? "-" : Regex.Replace(goalRecord, new string('.', count), m => m.Value + "\n");
            }

            set
            {
                goalRecord = value;
            }
        }

        public string BetStatus { get; set; }

        public string Remark
        {
            get
            {
                return string.IsNullOrEmpty(remark) ? "-" : remark;
            }

            set
            {
                remark = value;
            }
        }

        public int? BetType { get; set; }

        public string FullTimeScore => $"{FinalHomeScore}-{FinalAwayScore}";

        public string Result => string.IsNullOrEmpty(BetStatus) ? "-" : BetStatus.Replace(",", ", ");
    }
}