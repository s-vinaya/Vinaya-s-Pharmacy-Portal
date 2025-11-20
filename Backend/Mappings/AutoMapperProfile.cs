using AutoMapper;
using ReactPharmacyPortal.Models;
using ReactPharmacyPortal.DTOs;
using ReactPharmacyPortal.Enums;

namespace ReactPharmacyPortal.Mappings
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // User mappings
            CreateMap<User, UserDTO>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.ToString()))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
            CreateMap<UserDTO, User>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => Enum.Parse<UserRole>(src.Role)))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => Enum.Parse<UserStatus>(src.Status)));
            CreateMap<RegisterUserDto, User>()
                //Prevent users from setting CreatedAt and pwdhash, ensuring data integrity.
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore());
            CreateMap<RegisterPharmacistDto, User>()
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => UserRole.Pharmacist));
            CreateMap<RegisterCustomerDto, User>()
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => UserRole.Customer));



            // MedicineCategory mappings
            CreateMap<MedicineCategory, MedicineCategoryDTO>().ReverseMap();
            CreateMap<CreateMedicineCategoryDto, MedicineCategory>();
            CreateMap<UpdateMedicineCategoryDto, MedicineCategory>()
                .ForMember(dest => dest.CategoryId, opt => opt.Ignore());

            // Medicine mappings
            CreateMap<Medicine, MedicineDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.MedicineCategory.CategoryName))
                .ReverseMap();
            CreateMap<CreateMedicineDto, Medicine>()
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.MedicineCategory, opt => opt.Ignore());
            CreateMap<UpdateMedicineDto, Medicine>()
                .ForMember(dest => dest.MedicineId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.MedicineCategory, opt => opt.Ignore());

            // Order mappings
            CreateMap<Order, OrderDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
                .ReverseMap();
            CreateMap<CreateOrderDto, Order>()
                .ForMember(dest => dest.TotalAmount, opt => opt.Ignore())
                .ForMember(dest => dest.Status, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore());
            
            // OrderItem mappings
            CreateMap<OrderItem, OrderItemDTO>()
                .ForMember(dest => dest.MedicineName, opt => opt.MapFrom(src => src.Medicine.Name))
                .ReverseMap();
            CreateMap<CreateOrderItemDto, OrderItem>();



            // Prescription mappings
            CreateMap<Prescription, PrescriptionDto>()
                .ForMember(dest => dest.Medicines, opt => opt.MapFrom(src => src.PrescriptionMedicines))
                .ReverseMap();
            CreateMap<CreatePrescriptionDto, Prescription>()
                .ForMember(dest => dest.UploadedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Status, opt => opt.Ignore())
                .ForMember(dest => dest.Remarks, opt => opt.Ignore());
            CreateMap<UpdatePrescriptionDto, Prescription>();
            
            // PrescriptionMedicine mappings
            CreateMap<PrescriptionMedicine, PrescriptionMedicineDto>().ReverseMap();
            CreateMap<CreatePrescriptionMedicineDto, PrescriptionMedicine>();

            // Address mappings
            CreateMap<Address, AddressDTO>().ReverseMap();
            CreateMap<CreateAddressDto, Address>()
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore());
            CreateMap<UpdateAddressDto, Address>();


        }
    }
}
