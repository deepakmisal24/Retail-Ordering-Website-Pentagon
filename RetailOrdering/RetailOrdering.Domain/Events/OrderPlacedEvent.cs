using System;
using RetailOrdering.Domain.Entities;

namespace RetailOrdering.Domain.Events
{
    public class OrderPlacedEvent
    {
        public Order Order { get; }
        public DateTime Timestamp { get; } = DateTime.UtcNow;

        public OrderPlacedEvent(Order order)
        {
            Order = order ?? throw new ArgumentNullException(nameof(order));
        }
    }
}
