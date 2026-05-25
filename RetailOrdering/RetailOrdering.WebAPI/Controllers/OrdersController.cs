using System;
using System.Security.Claims;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RetailOrdering.Application.Features.Orders.Commands;
using RetailOrdering.Application.Features.Orders.Queries;
using RetailOrdering.Application.Interfaces;

namespace RetailOrdering.WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IAppDbContext _context;

        public OrdersController(IMediator mediator, IAppDbContext context)
        {
            _mediator = mediator;
            _context = context;
        }

        private int GetCurrentCustomerId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(idClaim) || !int.TryParse(idClaim, out int customerId))
            {
                throw new UnauthorizedAccessException("Customer is not authenticated.");
            }
            return customerId;
        }

        [Authorize(Roles = "Customer")]
        [HttpPost("checkout")]
        [Microsoft.AspNetCore.RateLimiting.EnableRateLimiting("CheckoutPolicy")]
        public async Task<IActionResult> Checkout([FromBody] PlaceOrderCommand command)
        {
            try
            {
                int customerId = GetCurrentCustomerId();
                command.CustomerId = customerId; // Ensure correct ownership

                var order = await _mediator.Send(command);
                return Ok(order);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Customer")]
        [HttpGet("my-history")]
        public async Task<IActionResult> GetMyHistory()
        {
            try
            {
                int customerId = GetCurrentCustomerId();
                var query = new GetUserOrdersQuery(customerId);
                var orders = await _mediator.Send(query);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Customer")]
        [HttpPost("reorder/{pastOrderId}")]
        public async Task<IActionResult> Reorder(int pastOrderId, [FromQuery] string street, [FromQuery] string city, [FromQuery] string zipCode)
        {
            try
            {
                int customerId = GetCurrentCustomerId();

                // Retrieve past order details
                var pastOrder = await _context.Orders
                    .Include(o => o.OrderItems)
                    .FirstOrDefaultAsync(o => o.Id == pastOrderId && o.CustomerId == customerId);

                if (pastOrder == null)
                {
                    return NotFound(new { message = "Past order not found." });
                }

                // If address not specified, reuse past order address!
                var finalStreet = string.IsNullOrWhiteSpace(street) ? pastOrder.ShippingAddress.Street : street;
                var finalCity = string.IsNullOrWhiteSpace(city) ? pastOrder.ShippingAddress.City : city;
                var finalZip = string.IsNullOrWhiteSpace(zipCode) ? pastOrder.ShippingAddress.ZipCode : zipCode;

                // Construct and trigger PlaceOrderCommand
                var command = new PlaceOrderCommand
                {
                    CustomerId = customerId,
                    Street = finalStreet,
                    City = finalCity,
                    ZipCode = finalZip,
                    CouponCode = "", // Coupon is not copied to force fresh checkout
                    RedeemLoyaltyPoints = false,
                    PackagingName = pastOrder.SelectedPackaging.Name,
                    PackagingPrice = pastOrder.SelectedPackaging.Price,
                    PackagingDescription = pastOrder.SelectedPackaging.Description,
                    Items = pastOrder.OrderItems.Select(oi => new PlaceOrderItemCommand
                    {
                        ProductId = oi.ProductId,
                        SelectedSize = oi.SelectedSize,
                        SelectedToppings = oi.SelectedToppings,
                        Quantity = oi.Quantity
                    }).ToList()
                };

                var newOrder = await _mediator.Send(command);
                return Ok(newOrder);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllOrders()
        {
            var query = new GetOrdersQuery();
            var orders = await _mediator.Send(query);
            return Ok(orders);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromQuery] string status)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound(new { message = "Order not found." });
            }

            order.OrderStatus = status;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Order status updated successfully." });
        }

        [HttpGet("simulated-emails")]
        public IActionResult GetSimulatedEmails()
        {
            var emails = RetailOrdering.Infrastructure.Services.EmailService.GetSentEmails();
            return Ok(emails);
        }
    }
}
