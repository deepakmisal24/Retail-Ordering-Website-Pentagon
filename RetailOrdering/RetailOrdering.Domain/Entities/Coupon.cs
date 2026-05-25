using System;

namespace RetailOrdering.Domain.Entities
{
    public class Coupon
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty; // e.g. PIZZA20
        public string DiscountType { get; set; } = "Percentage"; // Percentage or Flat
        public decimal DiscountValue { get; set; }
        public DateTime ExpiryDate { get; set; } = DateTime.UtcNow.AddMonths(1);
        public bool IsActive { get; set; } = true;

        public bool IsValid()
        {
            return IsActive && ExpiryDate > DateTime.UtcNow;
        }

        public decimal CalculateDiscount(decimal subtotal)
        {
            if (!IsValid()) return 0m;

            if (DiscountType.Equals("Percentage", StringComparison.OrdinalIgnoreCase))
            {
                return Math.Round(subtotal * (DiscountValue / 100m), 2);
            }
            else if (DiscountType.Equals("Flat", StringComparison.OrdinalIgnoreCase))
            {
                return Math.Min(DiscountValue, subtotal);
            }

            return 0m;
        }
    }
}
