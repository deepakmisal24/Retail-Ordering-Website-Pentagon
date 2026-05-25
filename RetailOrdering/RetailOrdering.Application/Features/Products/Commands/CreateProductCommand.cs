using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using RetailOrdering.Application.Interfaces;
using RetailOrdering.Domain.Entities;

namespace RetailOrdering.Application.Features.Products.Commands
{
    public class CreateProductCommand : IRequest<int>
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public int AvailableStock { get; set; }
        public int LowStockThreshold { get; set; } = 10;
        public string SizeOptionsJson { get; set; } = "[]";
        public string ToppingOptionsJson { get; set; } = "[]";
    }

    public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
    {
        public CreateProductCommandValidator()
        {
            RuleFor(v => v.Name).NotEmpty().MaximumLength(150);
            RuleFor(v => v.BasePrice).GreaterThan(0).WithMessage("Base price must be greater than zero.");
            RuleFor(v => v.Category).NotEmpty().MaximumLength(100);
            RuleFor(v => v.Brand).NotEmpty().MaximumLength(100);
            RuleFor(v => v.AvailableStock).GreaterThanOrEqualTo(0);
        }
    }

    public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, int>
    {
        private readonly IAppDbContext _context;

        public CreateProductCommandHandler(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<int> Handle(CreateProductCommand request, CancellationToken cancellationToken)
        {
            var product = new Product
            {
                Name = request.Name,
                Description = request.Description,
                BasePrice = request.BasePrice,
                Category = request.Category,
                Brand = request.Brand,
                ImageUrl = request.ImageUrl,
                AvailableStock = request.AvailableStock,
                LowStockThreshold = request.LowStockThreshold,
                SizeOptionsJson = request.SizeOptionsJson,
                ToppingOptionsJson = request.ToppingOptionsJson
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync(cancellationToken);

            return product.Id;
        }
    }
}
