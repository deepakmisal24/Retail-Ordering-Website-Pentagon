using System;

namespace RetailOrdering.Domain.Events
{
    public class StockUpdatedEvent
    {
        public int ProductId { get; }
        public int NewStockLevel { get; }
        public DateTime Timestamp { get; } = DateTime.UtcNow;

        public StockUpdatedEvent(int productId, int newStockLevel)
        {
            ProductId = productId;
            NewStockLevel = newStockLevel;
        }
    }
}
