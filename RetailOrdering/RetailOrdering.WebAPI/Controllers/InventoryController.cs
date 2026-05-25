using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RetailOrdering.Application.Interfaces;

namespace RetailOrdering.WebAPI.Controllers
{
    [ApiController]
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;
        private readonly IAppDbContext _context;

        public InventoryController(IInventoryService inventoryService, IAppDbContext context)
        {
            _inventoryService = inventoryService;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetInventory()
        {
            try
            {
                var stockList = await _context.Products
                    .Select(p => new
                    {
                        productId = p.Id,
                        name = p.Name,
                        category = p.Category,
                        brand = p.Brand,
                        availableStock = p.AvailableStock,
                        lowStockThreshold = p.LowStockThreshold,
                        isStockLow = p.AvailableStock <= p.LowStockThreshold,
                        imageUrl = p.ImageUrl
                    })
                    .ToListAsync();

                return Ok(stockList);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to retrieve stock list.", details = ex.Message });
            }
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateInventory([FromBody] InventoryUpdateRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var success = await _inventoryService.UpdateStockAsync(
                    request.ProductId,
                    request.AvailableStock,
                    request.LowStockThreshold
                );

                if (!success)
                {
                    return NotFound(new { message = "Product not found." });
                }

                return Ok(new { message = "Stock levels adjusted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update stock.", details = ex.Message });
            }
        }
    }

    public class InventoryUpdateRequest
    {
        public int ProductId { get; set; }
        public int AvailableStock { get; set; }
        public int LowStockThreshold { get; set; } = 10;
    }
}
