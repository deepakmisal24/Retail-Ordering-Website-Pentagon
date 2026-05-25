using System;
using System.Collections.Generic;

namespace RetailOrdering.Application.DTOs
{
    public class OrderDto
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public string CustomerUsername { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public decimal SubTotal { get; set; }
        public string CouponCode { get; set; } = string.Empty;
        public decimal DiscountAmount { get; set; }
        public int RedeemedLoyaltyPoints { get; set; }
        public decimal LoyaltyDiscount { get; set; }
        public string PackagingName { get; set; } = string.Empty;
        public decimal PackagingPrice { get; set; }
        public string ShippingAddress { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public int EarnedLoyaltyPoints { get; set; }
        public string OrderStatus { get; set; } = string.Empty;
        public List<OrderItemDto> OrderItems { get; set; } = new();
    }

    public class OrderItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ProductImageUrl { get; set; } = string.Empty;
        public string SelectedSize { get; set; } = string.Empty;
        public string SelectedToppings { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }
}
