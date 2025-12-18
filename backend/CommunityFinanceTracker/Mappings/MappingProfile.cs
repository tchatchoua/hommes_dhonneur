using AutoMapper;
using CommunityFinanceTracker.Models.Entities;
using CommunityFinanceTracker.Models.DTOs;
using System.Text.Json;

namespace CommunityFinanceTracker.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // User mappings
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.ToString()))
            .ForMember(dest => dest.AuthMethod, opt => opt.MapFrom(src => src.AuthMethod.ToString()))
            .ForMember(dest => dest.ChildrenNames, opt => opt.MapFrom(src => DeserializeChildrenNames(src.ChildrenNames)));

        CreateMap<User, UserProfileDto>()
            .ForMember(dest => dest.ChildrenNames, opt => opt.MapFrom(src => DeserializeChildrenNames(src.ChildrenNames)));

        CreateMap<CreateUserDto, User>()
            .ForMember(dest => dest.ChildrenNames, opt => opt.MapFrom(src => SerializeChildrenNames(src.ChildrenNames)))
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => Enum.Parse<UserRole>(src.Role, true)))
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore());

        CreateMap<UpdateUserDto, User>()
            .ForMember(dest => dest.ChildrenNames, opt => opt.MapFrom(src => SerializeChildrenNames(src.ChildrenNames)))
            .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

        // Contribution mappings
        CreateMap<Contribution, ContributionDto>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => $"{src.User.FirstName} {src.User.LastName}"))
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name));

        CreateMap<CreateContributionDto, Contribution>();
        CreateMap<UpdateContributionDto, Contribution>()
            .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

        // Debt mappings
        CreateMap<Debt, DebtDto>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => $"{src.User.FirstName} {src.User.LastName}"))
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name));

        CreateMap<CreateDebtDto, Debt>();
        CreateMap<UpdateDebtDto, Debt>()
            .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

        // Category mappings
        CreateMap<Category, CategoryDto>()
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()));

        CreateMap<CreateCategoryDto, Category>()
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => Enum.Parse<CategoryType>(src.Type, true)));

        CreateMap<UpdateCategoryDto, Category>()
            .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

        // Invitation mappings
        CreateMap<Invitation, InvitationDto>()
            .ForMember(dest => dest.InvitationUrl, opt => opt.Ignore());

        // Notification mappings
        CreateMap<Notification, NotificationDto>()
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()));

        CreateMap<NotificationSettings, NotificationSettingsDto>()
            .ForMember(dest => dest.DayOfWeek, opt => opt.MapFrom(src => src.DayOfWeek.HasValue ? src.DayOfWeek.ToString() : null));

        CreateMap<UpdateNotificationSettingsDto, NotificationSettings>()
            .ForMember(dest => dest.DayOfWeek, opt => opt.MapFrom(src => 
                !string.IsNullOrEmpty(src.DayOfWeek) ? Enum.Parse<DayOfWeek>(src.DayOfWeek, true) : (DayOfWeek?)null))
            .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
    }

    private static List<string>? DeserializeChildrenNames(string? json)
    {
        if (string.IsNullOrEmpty(json)) return null;
        try
        {
            return JsonSerializer.Deserialize<List<string>>(json);
        }
        catch
        {
            return null;
        }
    }

    private static string? SerializeChildrenNames(List<string>? names)
    {
        if (names == null || names.Count == 0) return null;
        return JsonSerializer.Serialize(names);
    }
}
