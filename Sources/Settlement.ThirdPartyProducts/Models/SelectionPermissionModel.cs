using Settlement.Services.Models;
using System.Collections.Generic;

namespace Settlement.ThirdPartyProducts.Models
{
    public class SelectionPermissionModel
    {
        public List<SelectionDetailModel> SelectionDetail { get; set; }

        public Permission Permission { get; set; }
    }
}