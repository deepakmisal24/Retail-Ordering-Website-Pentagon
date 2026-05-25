using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using RetailOrdering.Application.Interfaces;
using RetailOrdering.Domain.Entities;

namespace RetailOrdering.Infrastructure.Services
{
    public class LoggedEmail
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public string RecipientEmail { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string HtmlBody { get; set; } = string.Empty;
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }

    public class EmailService : IEmailService
    {
        private static readonly List<LoggedEmail> _sentEmails = new();
        private static int _nextId = 1;

        public static event Action<LoggedEmail>? OnEmailSent;

        public static List<LoggedEmail> GetSentEmails()
        {
            lock (_sentEmails)
            {
                return new List<LoggedEmail>(_sentEmails);
            }
        }

        public Task SendOrderConfirmationAsync(Order order, string customerEmail, string customerName)
        {
            var email = new LoggedEmail
            {
                Id = _nextId++,
                OrderId = order.Id,
                RecipientEmail = customerEmail,
                Subject = $"🍕 Slice & Sip: Order Confirmed #{order.Id:D6}",
                HtmlBody = FormatHtmlReceipt(order, customerName),
                SentAt = DateTime.UtcNow
            };

            lock (_sentEmails)
            {
                _sentEmails.Insert(0, email);
                if (_sentEmails.Count > 100) _sentEmails.RemoveAt(_sentEmails.Count - 1);
            }

            OnEmailSent?.Invoke(email);
            return Task.CompletedTask;
        }

        private string FormatHtmlReceipt(Order order, string customerName)
        {
            var sb = new StringBuilder();
            sb.Append($@"
<div style=""font-family: 'Outfit', sans-serif; background-color: #121218; color: #f8fafc; padding: 25px; border-radius: 12px; max-width: 550px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.08);"">
    <div style=""text-align: center; border-bottom: 2px solid rgba(245,158,11,0.2); padding-bottom: 15px; margin-bottom: 20px;"">
        <h2 style=""color: #F59E0B; margin: 0; font-size: 24px; letter-spacing: 1px;"">SLICE & SIP</h2>
        <p style=""color: #94a3b8; font-size: 13px; margin: 5px 0 0 0;"">Artisanal Wood-Fired Pizza, Craft Drinks & Breads</p>
    </div>
    
    <h3 style=""color: #ffffff; margin-top: 0;"">Thank you for your order, {customerName}!</h3>
    <p style=""color: #94a3b8; font-size: 14px; line-height: 1.5;"">We are already rolling out your artisanal choices. Here is a summary of your receipt:</p>
    
    <table style=""width: 100%; border-collapse: collapse; margin: 20px 0; background: rgba(255,255,255,0.02); border-radius: 8px; overflow: hidden;"">
        <tr style=""border-bottom: 1px solid rgba(255,255,255,0.05);"">
            <td style=""padding: 10px; color: #94a3b8; font-size: 13px;"">Order Reference:</td>
            <td style=""padding: 10px; color: #ffffff; font-weight: bold; text-align: right; font-size: 13px;"">#{order.Id:D6}</td>
        </tr>
        <tr style=""border-bottom: 1px solid rgba(255,255,255,0.05);"">
            <td style=""padding: 10px; color: #94a3b8; font-size: 13px;"">Destination Address:</td>
            <td style=""padding: 10px; color: #ffffff; text-align: right; font-size: 13px;"">{order.ShippingAddress.FullAddress}</td>
        </tr>
        <tr>
            <td style=""padding: 10px; color: #94a3b8; font-size: 13px;"">Order Status:</td>
            <td style=""padding: 10px; color: #10B981; font-weight: bold; text-align: right; font-size: 13px;"">PREPARING</td>
        </tr>
    </table>

    <h4 style=""color: #ffffff; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 5px; margin: 20px 0 10px 0;"">Your Items</h4>
");

            foreach (var item in order.OrderItems)
            {
                var toppingsLine = !string.IsNullOrWhiteSpace(item.SelectedToppings)
                    ? $"<div style=\"color:#f59e0b; font-size:12px; margin-top:2px;\">+ Toppings: {item.SelectedToppings}</div>"
                    : "";

                sb.Append($@"
    <div style=""padding: 10px 0; border-bottom: 1px dashed rgba(255,255,255,0.05); display: flex; justify-content: space-between;"">
        <div>
            <div style=""color: #ffffff; font-size: 14px; font-weight: 500;"">
                {item.Product?.Name} <span style=""color:#94a3b8; font-size: 12px;"">({item.SelectedSize})</span>
            </div>
            {toppingsLine}
            <div style=""color: #64748b; font-size: 11px; margin-top: 3px;"">Qty: {item.Quantity} @ ${item.UnitPrice:F2} each</div>
        </div>
        <div style=""color: #ffffff; font-weight: bold; font-size: 14px; text-align: right;"">${item.TotalPrice:F2}</div>
    </div>
");
            }

            sb.Append($@"
    <div style=""margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 10px;"">
        <table style=""width: 100%; border-collapse: collapse; font-size: 13px;"">
            <tr>
                <td style=""padding: 4px 0; color: #94a3b8;"">Subtotal:</td>
                <td style=""padding: 4px 0; color: #ffffff; text-align: right;"">${order.SubTotal:F2}</td>
            </tr>
");

            if (order.DiscountAmount > 0)
            {
                sb.Append($@"
            <tr>
                <td style=""padding: 4px 0; color: #ef4444;"">Coupon Discount ({order.CouponCode}):</td>
                <td style=""padding: 4px 0; color: #ef4444; text-align: right;"">-${order.DiscountAmount:F2}</td>
            </tr>
");
            }

            if (order.LoyaltyDiscount > 0)
            {
                sb.Append($@"
            <tr>
                <td style=""padding: 4px 0; color: #ef4444;"">Loyalty Points Discount ({order.RedeemedLoyaltyPoints} pts):</td>
                <td style=""padding: 4px 0; color: #ef4444; text-align: right;"">-${order.LoyaltyDiscount:F2}</td>
            </tr>
");
            }

            sb.Append($@"
            <tr>
                <td style=""padding: 4px 0; color: #94a3b8;"">Packaging ({order.SelectedPackaging.Name}):</td>
                <td style=""padding: 4px 0; color: #ffffff; text-align: right;"">${order.SelectedPackaging.Price * order.OrderItems.Sum(i => i.Quantity):F2}</td>
            </tr>
            <tr style=""border-top: 2px solid rgba(245,158,11,0.4);"">
                <td style=""padding: 10px 0 0 0; font-size: 16px; color: #ffffff; font-weight: bold;"">Grand Total:</td>
                <td style=""padding: 10px 0 0 0; font-size: 20px; color: #F59E0B; font-weight: bold; text-align: right;"">${order.TotalAmount:F2}</td>
            </tr>
        </table>
    </div>

    <div style=""margin-top: 20px; padding: 10px; background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.15); border-radius: 8px; text-align: center; color: #10b981; font-size: 13px; font-weight: 500;"">
        🎉 You accrued +{order.EarnedLoyaltyPoints} Loyalty Points with this order!
    </div>

    <div style=""margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 15px; text-align: center; color: #64748b; font-size: 11px;"">
        <p style=""margin: 0;"">&copy; 2026 Slice & Sip Ltd. 100 Wood-Fired Blvd, Pizza Valley.</p>
    </div>
</div>
");

            return sb.ToString();
        }
    }
}
