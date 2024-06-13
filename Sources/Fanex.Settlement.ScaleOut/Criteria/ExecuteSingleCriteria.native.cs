using Fanex.Data.Repository;

namespace Fanex.Settlement.ScaleOut.Criteria;

public class ExecuteSingleCriteria : NonQueryCommand
{
    public int ErrCode { get; set; }

    public string ErrMsg { get; set; }

    public override string GetSettingKey()
    {
        throw new NotImplementedException();
    }

    public override bool IsValid()
    {
        throw new NotImplementedException();
    }
}