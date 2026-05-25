using System;

namespace RetailOrdering.Domain.Entities
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public string Category { get; set; } = string.Empty; // Pizza, Cold Drinks, Breads
        public string Brand { get; set; } = string.Empty; // Tuscan Oven, Bistro Express, Artisan Bakers
        public string ImageUrl { get; set; } = string.Empty;
        
        public int AvailableStock { get; set; }
        public int LowStockThreshold { get; set; } = 10;

        // Customization configurations kept as JSON strings in the database
        public string SizeOptionsJson { get; set; } = "[]";
        public string ToppingOptionsJson { get; set; } = "[]";

        public bool IsAvailable => AvailableStock > 0;

        public void DeductStock(int quantity)
        {
            if (quantity <= 0) throw new ArgumentException("Quantity to deduct must be greater than zero.");
            if (AvailableStock < quantity) throw new InvalidOperationException($"Insufficient stock. Available: {AvailableStock}, Requested: {quantity}");
            AvailableStock -= quantity;
        }

        public void ReplenishStock(int quantity)
        {
            if (quantity <= 0) throw new ArgumentException("Quantity to replenish must be greater than zero.");
            AvailableStock += quantity;
        }

        public bool IsStockLow()
        {
            return AvailableStock <= LowStockThreshold;
        }
    }
}
