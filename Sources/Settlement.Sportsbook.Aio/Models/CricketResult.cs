using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace Settlement.Sportsbook.Aio.Models;

[XmlRoot("root")]
public class CricketResult
{
    [XmlElement("r")]
    public List<CricketResultItem> CricketResultItems { get; set; }
}

public class CricketResultItem
{
    [XmlAttribute("Id")]
    public string ResourceId { get; set; }

    [XmlAttribute("Home")]
    public string Home { get; set; }

    [XmlAttribute("Away")]
    public string Away { get; set; }

    [XmlAttribute("RefBettypeID")]
    public string RefBetTypeId { get; set; }

    [XmlAttribute("G")]
    public string Game { get; set; }

    [XmlAttribute("X")]
    public string X { get; set; }

    [XmlAttribute("Y")]
    public string Y { get; set; }

    [XmlAttribute("TeamIds")]
    public string TeamIds { get; set; }

    [XmlAttribute("OtherInfo")]
    public string OtherInfo { get; set; }
}

[XmlRoot("root")]
public class ExtraInfo
{
    [XmlElement("r")]
    public List<ExtraInfoItem> ExtraInfoItems { get; set; }
}

public class ExtraInfoItem
{
    [XmlAttribute("Id")]
    public string ResourceId { get; set; }

    [XmlAttribute("ReCalc")]
    public string ReCalcDateTime { get; set; }

    [XmlAttribute("Calc")]
    public string CalcDateTime { get; set; }
}