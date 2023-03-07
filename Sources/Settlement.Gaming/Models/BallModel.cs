using System.Xml.Serialization;

namespace Settlement.Gaming.Models;

public class BallModel
{
    public BallModel()
    {
    }

    public BallModel(int matchId, byte seq, byte numberBall)
    {
        MatchId = matchId;
        Seq = seq;
        NumberBall = numberBall;
    }

    [XmlIgnore]
    public int MatchId { get; set; }

    [XmlIgnore]
    public string EventStatus { get; set; }

    [XmlAttribute("Seq")]
    public byte Seq { get; set; }

    [XmlAttribute("Number")]
    public byte NumberBall { get; set; }

    [XmlAttribute("Color")]
    public string Color { get; set; }
}