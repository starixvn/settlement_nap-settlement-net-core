using MessagePack;

namespace Settlement.Core.Models
{
    [MessagePackObject]
    public class MoreScores
    {
        [Key("sets")]
        public Score[] Sets { get; set; }

        [Key("halfTimeScore")]
        public Score HalfTimeScore { get; set; }

        [Key("finalScore")]
        public Score FinalScore { get; set; }
    }
}