import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../utils/ProtectedRoute';

import Home from '../pages/Home/Home';
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import Campaigns from '../pages/Campaigns/Campaigns';
import CampaignDetails from '../pages/CampaignDetails/CampaignDetails';
import Donate from '../pages/Donate/Donate';
import Payment from '../pages/Payment/Payment';
import Receipt from '../pages/Receipt/Receipt';
import Profile from '../pages/Profile/Profile';
import ChangePassword from '../pages/Profile/ChangePassword';
import Contact from '../pages/Contact/Contact';
import About from '../pages/About/About';
import ApplyForHelp from '../pages/ApplyForHelp/ApplyForHelp';
import MyApplications from '../pages/ApplyForHelp/MyApplications';
import MyActivity from '../pages/MyActivity/MyActivity';
import ImpactReport from '../pages/ImpactReport/ImpactReport';

import AdminDashboard from '../admin/Dashboard/Dashboard';
import AdminUsers from '../admin/Users/Users';
import AdminDonors from '../admin/Donors/Donors';
import AdminCampaigns from '../admin/Campaigns/Campaigns';
import AdminDonations from '../admin/Donations/Donations';
import AdminPayments from '../admin/Payments/Payments';
import AdminBeneficiaries from '../admin/Beneficiaries/Beneficiaries';
import AdminFundAllocation from '../admin/FundAllocation/FundAllocation';
import AdminUrgentCampaign from '../admin/UrgentCampaign/UrgentCampaign';
import AdminReports from '../admin/Reports/Reports';
import AdminSettings from '../admin/Settings/Settings';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/campaigns" element={<Campaigns />} />
      <Route path="/campaigns/:id" element={<CampaignDetails />} />
      <Route path="/impact" element={<ImpactReport />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<About />} />

      {/* Donor (authenticated) routes */}
      <Route path="/donate/:campaignId" element={<ProtectedRoute><Donate /></ProtectedRoute>} />
      <Route path="/payment/:campaignId" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
      <Route path="/receipt/:id" element={<ProtectedRoute><Receipt /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
      <Route path="/apply-for-help" element={<ProtectedRoute><ApplyForHelp /></ProtectedRoute>} />
      <Route path="/my-applications" element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
      <Route path="/my-activity" element={<ProtectedRoute><MyActivity /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/donors" element={<ProtectedRoute adminOnly><AdminDonors /></ProtectedRoute>} />
      <Route path="/admin/campaigns" element={<ProtectedRoute adminOnly><AdminCampaigns /></ProtectedRoute>} />
      <Route path="/admin/donations" element={<ProtectedRoute adminOnly><AdminDonations /></ProtectedRoute>} />
      <Route path="/admin/payments" element={<ProtectedRoute adminOnly><AdminPayments /></ProtectedRoute>} />
      <Route path="/admin/beneficiaries" element={<ProtectedRoute adminOnly><AdminBeneficiaries /></ProtectedRoute>} />
      <Route path="/admin/fund-allocation" element={<ProtectedRoute adminOnly><AdminFundAllocation /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute adminOnly><AdminReports /></ProtectedRoute>} />
      <Route path="/admin/urgent-campaign" element={<ProtectedRoute adminOnly><AdminUrgentCampaign /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>} />

      <Route path="*" element={<Home />} />
    </Routes>
  );
}