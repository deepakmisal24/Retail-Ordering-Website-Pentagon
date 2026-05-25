using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RetailOrdering.Application.DTOs;
using RetailOrdering.Application.Interfaces;

namespace RetailOrdering.Application.Features.Orders.Queries
{
    public class GetUserOrdersQuery : IRequest<List<OrderDto>>
    {
        public int CustomerId { get; }

        public GetUserOrdersQuery(int customerId)
        {
            CustomerId = customerId;
        }
    }

    public class GetUserOrdersQueryHandler : IRequestHandler<GetUserOrdersQuery, List<OrderDto>>
    {
        private readonly IAppDbContext _context;
        private readonly IMapper _mapper;

        public GetUserOrdersQueryHandler(IAppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<OrderDto>> Handle(GetUserOrdersQuery request, CancellationToken cancellationToken)
        {
            var orders = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Where(o => o.CustomerId == request.CustomerId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync(cancellationToken);

            return _mapper.Map<List<OrderDto>>(orders);
        }
    }
}
