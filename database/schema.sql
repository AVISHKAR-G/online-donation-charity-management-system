-- Online Donation and Charity Management System
-- MySQL schema (matches EF Core model — EF migrations will actually create this,
-- this file is provided for reference / manual setup)

CREATE DATABASE IF NOT EXISTS donation_charity_db;
USE donation_charity_db;

CREATE TABLE Users (
    UserId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(150) NOT NULL,
    Email VARCHAR(200) NOT NULL UNIQUE,
    PasswordHash TEXT NOT NULL,
    Phone VARCHAR(20),
    Role INT NOT NULL DEFAULT 0, -- 0=Donor, 1=Admin
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    INDEX idx_users_email (Email)
);

CREATE TABLE Campaigns (
    CampaignId INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(200) NOT NULL,
    Description TEXT NOT NULL,
    Category VARCHAR(100),
    ImageUrl VARCHAR(500),
    TargetAmount DECIMAL(18,2) NOT NULL,
    CollectedAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    Status INT NOT NULL DEFAULT 0, -- 0=PendingApproval,1=Active,2=Completed,3=Rejected
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    EndDate DATETIME NULL,
    INDEX idx_campaigns_status (Status),
    INDEX idx_campaigns_category (Category)
);

CREATE TABLE Payments (
    PaymentId INT AUTO_INCREMENT PRIMARY KEY,
    TransactionId VARCHAR(50) NOT NULL,
    Method INT NOT NULL, -- 0=UPI,1=Card,2=NetBanking,3=PayPal,4=Wallet
    Status INT NOT NULL DEFAULT 0, -- 0=Pending,1=Success,2=Failed,3=Refunded
    Amount DECIMAL(18,2) NOT NULL,
    PaymentDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Donations (
    DonationId INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    CampaignId INT NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    PaymentId INT NULL,
    Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    IsAnonymous BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT FK_Donations_Users FOREIGN KEY (UserId) REFERENCES Users(UserId),
    CONSTRAINT FK_Donations_Campaigns FOREIGN KEY (CampaignId) REFERENCES Campaigns(CampaignId),
    CONSTRAINT FK_Donations_Payments FOREIGN KEY (PaymentId) REFERENCES Payments(PaymentId) ON DELETE SET NULL,
    INDEX idx_donations_user (UserId),
    INDEX idx_donations_campaign (CampaignId),
    INDEX idx_donations_date (Date)
);

CREATE TABLE Beneficiaries (
    BeneficiaryId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(150) NOT NULL,
    Purpose TEXT NOT NULL,
    CampaignId INT NOT NULL,
    AllocatedAmount DECIMAL(18,2) NOT NULL,
    Status INT NOT NULL DEFAULT 0, -- 0=Pending,1=Approved,2=FundsDisbursed,3=Rejected
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Beneficiaries_Campaigns FOREIGN KEY (CampaignId) REFERENCES Campaigns(CampaignId) ON DELETE CASCADE
);

CREATE TABLE Receipts (
    ReceiptId INT AUTO_INCREMENT PRIMARY KEY,
    DonationId INT NOT NULL,
    ReceiptNumber VARCHAR(50) NOT NULL,
    GeneratedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Receipts_Donations FOREIGN KEY (DonationId) REFERENCES Donations(DonationId) ON DELETE CASCADE
);

-- =====================================================
-- SEED DATA (optional — safe to skip/remove for production)
-- Password for ALL seeded users below hashes to: Admin@123
-- Generate your own hashes via the API's BCrypt library instead of reusing these in production.
-- =====================================================

-- Admin account
INSERT INTO Users (Name, Email, PasswordHash, Role, Phone) VALUES
('Admin User', 'admin@hopecare.org', '$2a$11$8K1p/a0dURXAmYE0knm.LOaVzY5g6t3.4dSOxlG3v5qCwmVU6.Aoi', 1, '9876500000');

-- Sample donors
INSERT INTO Users (Name, Email, PasswordHash, Role, Phone) VALUES
('Rahul Sharma', 'rahul@example.com', '$2a$11$8K1p/a0dURXAmYE0knm.LOaVzY5g6t3.4dSOxlG3v5qCwmVU6.Aoi', 0, '9876543210'),
('Priya Patel',  'priya@example.com', '$2a$11$8K1p/a0dURXAmYE0knm.LOaVzY5g6t3.4dSOxlG3v5qCwmVU6.Aoi', 0, '9876543211'),
('Amit Kumar',   'amit@example.com',  '$2a$11$8K1p/a0dURXAmYE0knm.LOaVzY5g6t3.4dSOxlG3v5qCwmVU6.Aoi', 0, '9876543212'),
('Neha Verma',   'neha@example.com',  '$2a$11$8K1p/a0dURXAmYE0knm.LOaVzY5g6t3.4dSOxlG3v5qCwmVU6.Aoi', 0, '9876543213');

-- Sample campaigns (Status: 1 = Active)
INSERT INTO Campaigns (Title, Description, Category, ImageUrl, TargetAmount, CollectedAmount, Status) VALUES
('Education For All', 'Help poor children to get quality education and build a better future.', 'Education', 'https://placehold.co/600x400?text=Education', 500000, 235000, 1),
('Medical Help', 'Support underprivileged people to get better medical facilities.', 'Healthcare', 'https://placehold.co/600x400?text=Medical', 400000, 180000, 1),
('Flood Relief Fund', 'Help the victims of flood and provide them food, water and shelter.', 'Disaster Relief', 'https://placehold.co/600x400?text=Flood+Relief', 600000, 360000, 1),
('Food For All', 'Providing nutritious food to underprivileged people.', 'Food & Hunger', 'https://placehold.co/600x400?text=Food', 250000, 125000, 1);

-- Sample payments (Status: 1 = Success)
INSERT INTO Payments (TransactionId, Method, Status, Amount) VALUES
('TXN123456', 0, 1, 1000.00),  -- UPI
('TXN123455', 1, 1, 500.00),   -- Card
('TXN123454', 2, 1, 2000.00),  -- Net Banking
('TXN123453', 4, 1, 750.00);   -- Wallet

-- Sample donations (linking donors, campaigns, and payments above)
INSERT INTO Donations (UserId, CampaignId, Amount, PaymentId, IsAnonymous) VALUES
(2, 1, 1000.00, 1, FALSE),  -- Rahul -> Education For All
(3, 2, 500.00,  2, FALSE),  -- Priya -> Medical Help
(4, 3, 2000.00, 3, FALSE),  -- Amit  -> Flood Relief Fund
(5, 4, 750.00,  4, FALSE);  -- Neha  -> Food For All

-- Sample receipts
INSERT INTO Receipts (DonationId, ReceiptNumber) VALUES
(1, 'RCPT-2024-000123'),
(2, 'RCPT-2024-000122'),
(3, 'RCPT-2024-000121'),
(4, 'RCPT-2024-000120');

-- Sample beneficiaries
INSERT INTO Beneficiaries (Name, Purpose, CampaignId, AllocatedAmount, Status) VALUES
('Sunrise Public School', 'Books and uniforms for 50 students', 1, 100000, 1),
('City Community Clinic', 'Free medical camps for 3 months', 2, 80000, 1),
('Riverside Relief Center', 'Emergency food and shelter kits', 3, 150000, 2);
