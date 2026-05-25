using System;
using System.Collections.Generic;
using RetailOrdering.Domain.ValueObjects;

namespace RetailOrdering.Domain.Entities
{
    public class Order
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public Customer? Customer { get; set; }

        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        public decimal SubTotal { get; set; }
        public string CouponCode { get; set; } = string.Empty;
        public decimal DiscountAmount { get; set; }

        public int RedeemedLoyaltyPoints { get; set; }
        public decimal LoyaltyDiscount { get; set; }

        // Mapped as EF Owned Entity
        public PackagingOption SelectedPackaging { get; set; } = new("Regular Box", 0.50m, "Standard Carton");

        // Mapped as EF Owned Entity
        public Address ShippingAddress { get; set; } = new("100 Main St", "Pizza City", "12345");

        public decimal TotalAmount { get; set; }
        public int EarnedLoyaltyPoints { get; set; }

        public string OrderStatus { get; set; } = "Pending"; // Pending, Preparing, OutForDelivery, Delivered, Cancelled

        public List<OrderItem> OrderItems { get; set; } = new();

        public void CompleteOrder()
        {
            OrderStatus = "Delivered";
        }

        public void CancelOrder()
        {
            OrderStatus = "Cancelled";
        }
    }
}
