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
                .ForMember(dest => dest.ProductImageUrl, opt => opt.MapFrom(src => src.Product != null ? src.Product.ImageUrl : string.Empty))
                .ForMember(dest => dest.ProductCategory, opt => opt.MapFrom(src => src.Product != null ? src.Product.Category : string.Empty));

            CreateMap<Order, OrderDto>()
                .ForMember(dest => dest.CustomerUsername, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.Username : string.Empty))
                .ForMember(dest => dest.CustomerEmail, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.Email : string.Empty))
                .ForMember(dest => dest.PackagingName, opt => opt.MapFrom(src => src.SelectedPackaging.Name))
                .ForMember(dest => dest.SelectedPackagingName, opt => opt.MapFrom(src => src.SelectedPackaging.Name))
                .ForMember(dest => dest.PackagingPrice, opt => opt.MapFrom(src => src.SelectedPackaging.Price))
                .ForMember(dest => dest.ShippingAddress, opt => opt.MapFrom(src => src.ShippingAddress.FullAddress))
                .ForMember(dest => dest.ShippingAddressStreet, opt => opt.MapFrom(src => src.ShippingAddress.Street))
                .ForMember(dest => dest.ShippingAddressCity, opt => opt.MapFrom(src => src.ShippingAddress.City))
                .ForMember(dest => dest.ShippingAddressZipCode, opt => opt.MapFrom(src => src.ShippingAddress.ZipCode));
        }
    }
}
