namespace Settlement.Core.Models
{
    public class Score
    {
        public Score()
        {
        }

        public Score(string value)
        {
            Home = Away = value;
        }

        public Score(string home, string away)
        {
            Home = home;
            Away = away;
        }

        public Score(string home, string away, string background)
            : this(home, away)
        {
            Background = background;
        }

        public string Home { get; set; }

        public string Away { get; set; }

        public string Background { get; set; }

        public bool IsDirty { get; set; }

        public bool EqualValue(Score score)
        {
            return Home == score.Home && Away == score.Away;
        }
    }
}