# Online Donation and Charity Management System

Full-stack app: **React (Vite)** frontend + **ASP.NET Core 8 Web API** backend + **MySQL** database.

## Folder Structure
```
DonationSystem/
├── backend/DonationAPI/     ASP.NET Core Web API
├── frontend/                React app (Vite)
└── database/schema.sql      Reference SQL schema
```

## Backend Setup

1. Install .NET 8 SDK.
2. Update the MySQL connection string in `backend/DonationAPI/appsettings.json`:
   ```
   "DefaultConnection": "Server=localhost;Port=3306;Database=donation_charity_db;User=root;Password=YOUR_PASSWORD;"
   ```
3. Restore packages and create the database via EF Core migrations:
   ```bash
   cd backend/DonationAPI
   dotnet restore
   dotnet tool install --global dotnet-ef   # if not already installed
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```
   (Alternatively, run `database/schema.sql` directly in MySQL.)
4. Run the API:
   ```bash
   dotnet run
   ```
   The project is configured to run on plain **http** (no dev HTTPS certificate needed) at `http://localhost:5195`.
   Swagger UI: `http://localhost:5195/swagger`.

   > If you previously hit "Unable to connect to web server... web server is no longer running" in Visual Studio,
   > that's almost always the HTTPS dev certificate not being trusted. Running on http (as configured here)
   > avoids that entirely. If you ever want https back, run `dotnet dev-certs https --trust` first.
5. Create your first admin: register a normal user via `/api/auth/register`, then manually set `Role = 1` for that row in the `Users` table (or use the seeded admin in `schema.sql`: `admin@hopecare.org` / `Admin@123`).

## Frontend Setup

1. Install Node.js 18+.
2. ```bash
   cd frontend
   npm install
   ```
3. Copy `.env.example` to `.env` and set `VITE_API_URL` to match your API's base URL (from step 4 above, plus `/api`).
4. ```bash
   npm run dev
   ```
   App runs at `http://localhost:5173`.

## Core Flow Implemented
- Register / Login (JWT auth, donor vs admin roles)
- Browse & search campaigns, view campaign details
- Donate → select amount & payment method → simulated payment processing → auto-generated receipt
- Donor profile with donation history
- Admin dashboard with charts (donations over time, by category)
- Admin CRUD: Campaigns, Beneficiaries; read views: Users, Donors, Donations, Payments, Fund Allocation, Reports (CSV export)

## Notes & Next Steps
- **Payments** are simulated (`PaymentService.ProcessPaymentAsync` always succeeds) — swap in a real gateway (Razorpay/Stripe/PayPal) when ready; the interface is already isolated for that.
- **Receipts** are generated as data records; wire in a PDF library (e.g. QuestPDF) for downloadable PDF receipts if needed — the "Download Receipt" button currently uses browser print.
- Add role-based campaign-approval workflow (approve/reject pending campaigns) as the next admin feature — the `Status` enum already supports it.
- Add pagination to admin tables once data volume grows.
