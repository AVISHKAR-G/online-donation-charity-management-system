using DonationAPI.DTOs;
using DonationAPI.Models;

namespace DonationAPI.Services
{
    public interface IUrgentCampaignService
    {
        Task<UrgentCampaignResultDto> SendToAllDonorsAsync(SendUrgentCampaignDto dto);

        Task SendActiveCampaignToNewUserAsync(User newUser);
    }
}