namespace Fanex.Settlement.ScaleOut.Criteria;

public class GetDeploymentInfoCriteria : ExecuteCriteria
{
    public string SpName { get; set; }

    public override string GetSettingKey() => $"NAP_Set_SPDeploymentInfo_{DbServer}";

    public override bool IsValid() => !string.IsNullOrEmpty(SpName);
}