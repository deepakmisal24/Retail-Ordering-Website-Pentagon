using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RetailOrdering.Application.DTOs;
using RetailOrdering.Application.Interfaces;

namespace RetailOrdering.Application.Features.Products.Queries
{
    public class GetProductsQuery : IRequest<List<ProductDto>>
    {
        public string? Category { get; set; }
        public string? Brand { get; set; }
    }

    public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, List<ProductDto>>
    {
        private readonly IAppDbContext _context;
        private readonly IMapper _mapper;

        public GetProductsQueryHandler(IAppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<ProductDto>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
        {
            var query = _context.Products.AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.Category))
            {
                query = query.Where(p => p.Category.ToLower() == request.Category.ToLower());
            }

            if (!string.IsNullOrWhiteSpace(request.Brand))
            {
                query = query.Where(p => p.Brand.ToLower() == request.Brand.ToLower());
            }

            var products = await query.ToListAsync(cancellationToken);
            return _mapper.Map<List<ProductDto>>(products);
        }
    }
}
