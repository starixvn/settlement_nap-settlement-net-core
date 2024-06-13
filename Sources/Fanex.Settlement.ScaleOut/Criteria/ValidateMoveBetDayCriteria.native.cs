using System;

namespace Fanex.Settlement.ScaleOut.Criteria;

public class ValidateMoveBetDayCriteria : ExecuteCriteria
{
	public string MatchIds { get; set; }

	public string EventTable { get; set; }

	public DateTime? EventDate { get; set; }

	public override string GetSettingKey()
	{
		return $"NAP_Admin_Settlement_CheckingMoveBetDay_{DbServer}";
	}

	public override bool IsValid()
	{
		return !string.IsNullOrWhiteSpace(DbServer);
	}
}