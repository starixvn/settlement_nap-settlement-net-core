using System;
using System.Collections.Generic;

namespace Settlement.Core.Models
{
    public class BetStatusHelper
    {
        private const int ThreeSets = 3;

        private const int FourSets = 4;

        private const int FiveSets = 5;

        public BetStatusHelper()
        {
        }

        public BetStatusHelper(int groupSport, string betStatus)
            : this()
        {
            const int footballGroup = 2;
            const int iceHockeyGroup = 3;
            const int baseballGroup = 5;
            const int volleyballGroup = 7;
            if (groupSport == footballGroup)
            {
                Football(betStatus);
            }

            if (groupSport == iceHockeyGroup)
            {
                Hockey(betStatus);
            }
            if (groupSport == baseballGroup)
            {
                Baseball(betStatus);
            }

            if (groupSport == volleyballGroup)
            {
                Volleyball(betStatus);
            }
        }

        public int? Home1Q { get; set; }

        public int? Away1Q { get; set; }

        public int? Home2Q { get; set; }

        public int? Away2Q { get; set; }

        public int? Home3Q { get; set; }

        public int? Away3Q { get; set; }

        public int? Home4Q { get; set; }

        public int? Away4Q { get; set; }

        public int? Home5Q { get; set; }

        public int? Away5Q { get; set; }

        public int? Home6Q { get; set; }

        public int? Away6Q { get; set; }

        public int? Home7Q { get; set; }

        public int? Away7Q { get; set; }

        public int? Home8Q { get; set; }

        public int? Away8Q { get; set; }

        public int? Home9Q { get; set; }

        public int? Away9Q { get; set; }

        public int? HomeOT { get; set; }

        public int? AwayOT { get; set; }

        public int? HomeTotalGames { get; set; }

        public int? AwayTotalGames { get; set; }

        private static string[] ArrayBetStatus(string betStatus)
        {
            const int twoLength = 2;
            if (string.IsNullOrWhiteSpace(betStatus))
            {
                return new string[] { };
            }

            return betStatus.IndexOf(';') > -1 && betStatus.Split(';').Length >= twoLength
                                 ? betStatus.Split(';')[1].Split(',')
                                 : betStatus.Split(',');
        }

        private void Football(string betStatus)
        {
            var arrayBetStatus = ArrayBetStatus(betStatus);

            for (var i = 0; i < arrayBetStatus.Length; i++)
            {
                var score = arrayBetStatus[i].Trim().Split('-');
                if (score.Length <= 1)
                {
                    continue;
                }

                if (i < FourSets)
                {
                    ScoreToFourSet(i, score);
                }
                else
                {
                    ScoreToOverTimeSet(score);
                }
            }
        }

        private void Hockey(string betStatus)
        {
            var arrayBetStatus = ArrayBetStatus(betStatus);

            for (var i = 0; i < arrayBetStatus.Length; i++)
            {
                var score = arrayBetStatus[i].Trim().Split('-');
                if (score.Length <= 1)
                {
                    continue;
                }

                if (i < ThreeSets)
                {
                    ScoreToThreeSet(i, score);
                }
                else
                {
                    ScoreToOverTimeSet(score);
                }
            }
        }

        private void Volleyball(string betStatus)
        {
            var arrayBetStatus = ArrayBetStatus(betStatus);
            HomeTotalGames = 0;
            AwayTotalGames = 0;

            for (var i = 0; i < arrayBetStatus.Length; i++)
            {
                var score = arrayBetStatus[i].Trim().Split('-');
                if (score.Length <= 1)
                {
                    continue;
                }

                var homeSet = Convert.ToInt32(arrayBetStatus[i].Trim().Split('-')[0]);
                var awaySet = Convert.ToInt32(arrayBetStatus[i].Trim().Split('-')[1]);

                HomeTotalGames += homeSet;
                AwayTotalGames += awaySet;

                ScoreToFiveSet(i, score);
            }
        }

        private void Baseball(string betStatus)
        {
            var arrayBetStatus = ArrayBetStatus(betStatus);

            for (var i = 0; i < arrayBetStatus.Length; i++)
            {
                var score = arrayBetStatus[i].Trim().Split('-');
                if (score.Length > 1)
                {
                    SetScoreBaseball(i, score);
                }
            }
        }

        private void SetScoreBaseball(int i, IList<string> score)
        {
            if (i < FiveSets)
            {
                ScoreToFiveSet(i, score);
            }
            else
            {
                const int setFive = 5;
                const int setSix = 6;
                const int setSeven = 7;
                const int setEight = 8;
                const int setNine = 9;
                switch (i)
                {
                    case setFive:
                        Home6Q = Convert.ToInt32(score[0]);
                        Away6Q = Convert.ToInt32(score[1]);
                        break;

                    case setSix:
                        Home7Q = Convert.ToInt32(score[0]);
                        Away7Q = Convert.ToInt32(score[1]);
                        break;

                    case setSeven:
                        Home8Q = Convert.ToInt32(score[0]);
                        Away8Q = Convert.ToInt32(score[1]);
                        break;

                    case setEight:
                        Home9Q = Convert.ToInt32(score[0]);
                        Away9Q = Convert.ToInt32(score[1]);
                        break;

                    case setNine:
                        HomeOT = Convert.ToInt32(score[0]);
                        AwayOT = Convert.ToInt32(score[1]);
                        break;

                    default:
                        throw new InvalidOperationException("Unexpected value i of SetScoreBaseball = " + i);
                }
            }
        }

        private void ScoreToThreeSet(int i, IList<string> score)
        {
            switch (i)
            {
                case 0:
                    Home1Q = Convert.ToInt32(score[0]);
                    Away1Q = Convert.ToInt32(score[1]);
                    break;

                case 1:
                    Home2Q = Convert.ToInt32(score[0]);
                    Away2Q = Convert.ToInt32(score[1]);
                    break;

                default:
                    Home3Q = Convert.ToInt32(score[0]);
                    Away3Q = Convert.ToInt32(score[1]);
                    break;
            }
        }

        private void ScoreToFourSet(int i, IList<string> score)
        {
            if (i < ThreeSets)
            {
                ScoreToThreeSet(i, score);
            }
            else
            {
                Home4Q = Convert.ToInt32(score[0]);
                Away4Q = Convert.ToInt32(score[1]);
            }
        }

        private void ScoreToFiveSet(int i, IList<string> score)
        {
            if (i < FourSets)
            {
                ScoreToFourSet(i, score);
            }
            else
            {
                Home5Q = Convert.ToInt32(score[0]);
                Away5Q = Convert.ToInt32(score[1]);
            }
        }

        private void ScoreToOverTimeSet(IList<string> score)
        {
            HomeOT = Convert.ToInt32(score[0]);
            AwayOT = Convert.ToInt32(score[1]);
        }
    }
}