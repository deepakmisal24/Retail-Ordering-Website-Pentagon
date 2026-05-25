using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RetailOrdering.Application.DTOs;
using RetailOrdering.Application.Interfaces;
using RetailOrdering.Domain.Entities;
using RetailOrdering.Domain.ValueObjects;

namespace RetailOrdering.Application.Features.Orders.Commands
{
    public class PlaceOrderCommand : IRequest<OrderDto>
    {
        public int CustomerId { get; set; }
        public List<PlaceOrderItemCommand> Items { get; set; } = new();
        public string CouponCode { get; set; } = string.Empty;
        public bool RedeemLoyaltyPoints { get; set; }
        
        // Shipping Address inputs
        public string Street { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;

        // Packaging choice inputs
        public string PackagingName { get; set; } = "Regular Box";
        public decimal PackagingPrice { get; set; } = 0.50m;
        public string PackagingDescription { get; set; } = "Standard Carton Box";
    }

    public class PlaceOrderItemCommand
    {
        public int ProductId { get; set; }
        public string SelectedSize { get; set; } = "Regular";
        public string SelectedToppings { get; set; } = string.Empty; // e.g. "Pepperoni, Extra Cheese"
        public int Quantity { get; set; }
    }

    public class PlaceOrderCommandValidator : AbstractValidator<PlaceOrderCommand>
    {
        public PlaceOrderCommandValidator()
        {
            RuleFor(v => v.CustomerId).GreaterThan(0);
            RuleFor(v => v.Street).NotEmpty().MaximumLength(150);
            RuleFor(v => v.City).NotEmpty().MaximumLength(100);
            RuleFor(v => v.ZipCode).NotEmpty().MaximumLength(20);
            RuleFor(v => v.Items).NotEmpty().WithMessage("At least one item must be added to place an order.");
            RuleForEach(v => v.Items).ChildRules(item =>
            {
                item.RuleFor(i => i.ProductId).GreaterThan(0);
                item.RuleFor(i => i.Quantity).GreaterThan(0).LessThanOrEqualTo(100);
            });
        }
    }

    public class PlaceOrderCommandHandler : IRequestHandler<PlaceOrderCommand, OrderDto>
    {
        private readonly IAppDbContext _context;
        private readonly IInventoryService _inventoryService;
        private readonly IEmailService _emailService;
        private readonly IMapper _mapper;

        public PlaceOrderCommandHandler(
            IAppDbContext context,
            IInventoryService inventoryService,
            IEmailService emailService,
            IMapper mapper)
        {
            _context = context;
            _inventoryService = inventoryService;
            _emailService = emailService;
            _mapper = mapper;
        }

        public async Task<OrderDto> Handle(PlaceOrderCommand request, CancellationToken cancellationToken)
        {
            // 1. Retrieve Customer
            var customer = await _context.Customers.FindAsync(new object[] { request.CustomerId }, cancellationToken);
            if (customer == null) throw new Exception("Customer account not found.");

            // 2. Pre-verify and deduct inventory stock
            foreach (var itemReq in request.Items)
            {
                var product = await _context.Products.FindAsync(new object[] { itemReq.ProductId }, cancellationToken);
                if (product == null) throw new Exception($"Product ID {itemReq.ProductId} not found.");

                // Thread-safe deduction
                var stockDeducted = await _inventoryService.CheckAndDeductStockAsync(itemReq.ProductId, itemReq.Quantity);
                if (!stockDeducted)
                {
                    throw new Exception($"Insufficient stock for item '{product.Name}'. Available stock: {product.AvailableStock}");
                }
            }

            // 3. Construct Order Entity
            var packaging = new PackagingOption(request.PackagingName, request.PackagingPrice, request.PackagingDescription);
            var address = new Address(request.Street, request.City, request.ZipCode);

            var order = new Order
            {
                CustomerId = request.CustomerId,
                OrderDate = DateTime.UtcNow,
                ShippingAddress = address,
                SelectedPackaging = packaging,
                OrderStatus = "Preparing"
            };

            decimal subtotal = 0m;
            var orderItems = new List<OrderItem>();

            // 4. Calculate prices
            foreach (var itemReq in request.Items)
            {
                var product = await _context.Products.FindAsync(new object[] { itemReq.ProductId }, cancellationToken);
                if (product == null) throw new Exception("Product not found.");

                // Parse sizes
                var sizes = JsonSerializer.Deserialize<List<SizeOptionDto>>(product.SizeOptionsJson) ?? new();
                var matchedSize = sizes.FirstOrDefault(s => s.Name.Equals(itemReq.SelectedSize, StringComparison.OrdinalIgnoreCase))
                                  ?? new SizeOptionDto { Name = "Regular", PriceModifier = 0m };

                // Parse toppings
                var toppings = JsonSerializer.Deserialize<List<ToppingOptionDto>>(product.ToppingOptionsJson) ?? new();
                decimal toppingsCost = 0m;

                var selectedToppingNames = itemReq.SelectedToppings
                    .Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(t => t.Trim())
                    .ToList();

                foreach (var name in selectedToppingNames)
                {
                    var match = toppings.FirstOrDefault(t => t.Name.Equals(name, StringComparison.OrdinalIgnoreCase));
                    if (match != null)
                    {
                        toppingsCost += match.Price;
                    }
                }

                decimal unitPrice = product.BasePrice + matchedSize.PriceModifier + toppingsCost;
                decimal itemTotal = unitPrice * itemReq.Quantity;

                subtotal += itemTotal;

                orderItems.Add(new OrderItem
                {
                    ProductId = itemReq.ProductId,
                    SelectedSize = itemReq.SelectedSize,
                    SelectedToppings = itemReq.SelectedToppings,
                    Quantity = itemReq.Quantity,
                    UnitPrice = unitPrice
                });
            }

            order.SubTotal = subtotal;

            // 5. Apply Coupon Discount
            decimal couponDiscount = 0m;
            if (!string.IsNullOrWhiteSpace(request.CouponCode))
            {
                var coupon = await _context.Coupons.FirstOrDefaultAsync(c => c.Code.ToUpper() == request.CouponCode.ToUpper() && c.IsActive, cancellationToken);
                if (coupon != null && coupon.IsValid())
                {
                    couponDiscount = coupon.CalculateDiscount(subtotal);
                    order.CouponCode = coupon.Code;
                    order.DiscountAmount = couponDiscount;
                }
            }

            // 6. Apply Loyalty Points Redemption (100 points = $1.00)
            decimal loyaltyDiscount = 0m;
            int pointsToRedeem = 0;
            if (request.RedeemLoyaltyPoints && customer.LoyaltyPoints > 0)
            {
                decimal maxRemaining = subtotal - couponDiscount;
                if (maxRemaining > 0)
                {
                    int pointsNeeded = (int)Math.Ceiling(maxRemaining * 100m);
                    pointsToRedeem = Math.Min(customer.LoyaltyPoints, pointsNeeded);

                    loyaltyDiscount = Math.Round(pointsToRedeem / 100m, 2);
                    if (loyaltyDiscount > maxRemaining)
                    {
                        loyaltyDiscount = maxRemaining;
                    }

                    order.RedeemedLoyaltyPoints = pointsToRedeem;
                    order.LoyaltyDiscount = loyaltyDiscount;

                    // Deduct from customer
                    customer.RedeemPoints(pointsToRedeem);
                }
            }

            // 7. Calculate Grand Total
            decimal packagingTotal = packaging.Price * request.Items.Sum(i => i.Quantity);
            order.TotalAmount = Math.Max(0m, (subtotal - couponDiscount - loyaltyDiscount) + packagingTotal);

            // 8. Calculate Earned Points (10 points per dollar spent)
            int earnedPoints = (int)Math.Floor(order.TotalAmount) * 10;
            order.EarnedLoyaltyPoints = earnedPoints;

            // Accrue to customer
            customer.AccruePoints(earnedPoints);

            // Save Order to Db
            _context.Orders.Add(order);
            await _context.SaveChangesAsync(cancellationToken);

            // Save Order Items
            foreach (var item in orderItems)
            {
                item.OrderId = order.Id;
                _context.OrderItems.Add(item);
            }
            await _context.SaveChangesAsync(cancellationToken);

            // Refresh EF relations for nice DTO mapping and email formatting
            var finalOrder = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == order.Id, cancellationToken);

            if (finalOrder != null)
            {
                // 9. Dispatch Email receipt
                await _emailService.SendOrderConfirmationAsync(finalOrder, customer.Email, customer.Username);
            }

            return _mapper.Map<OrderDto>(finalOrder ?? order);
        }
    }

    public class SizeOptionDto
    {
        public string Name { get; set; } = string.Empty;
        public decimal PriceModifier { get; set; }
    }

    public class ToppingOptionDto
    {
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
    }
}
