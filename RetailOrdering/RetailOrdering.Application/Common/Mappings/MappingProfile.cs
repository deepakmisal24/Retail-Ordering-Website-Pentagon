using AutoMapper;
using RetailOrdering.Domain.Entities;
using RetailOrdering.Application.DTOs;

namespace RetailOrdering.Application.Common.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Product, ProductDto>()
                .ForMember(dest => dest.IsStockLow, opt => opt.MapFrom(src => src.IsStockLow()));

            CreateMap<OrderItem, OrderItemDto>()
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product != null ? src.Product.Name : string.Empty))
                .ForMember(dest => dest.ProductImageUrl, opt => opt.MapFrom(src => src.Product != null ? src.Product.ImageUrl : string.Empty));

            CreateMap<Order, OrderDto>()
                .ForMember(dest => dest.CustomerUsername, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.Username : string.Empty))
                .ForMember(dest => dest.PackagingName, opt => opt.MapFrom(src => src.SelectedPackaging.Name))
                .ForMember(dest => dest.PackagingPrice, opt => opt.MapFrom(src => src.SelectedPackaging.Price))
                .ForMember(dest => dest.ShippingAddress, opt => opt.MapFrom(src => src.ShippingAddress.FullAddress));
        }
    }
}
