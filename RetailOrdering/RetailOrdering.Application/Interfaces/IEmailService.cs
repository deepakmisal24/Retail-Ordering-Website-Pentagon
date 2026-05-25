using System.Threading.Tasks;
using RetailOrdering.Domain.Entities;

namespace RetailOrdering.Application.Interfaces
{
    public interface IEmailService
    {
        Task SendOrderConfirmationAsync(Order order, string customerEmail, string customerName);
    }
}
