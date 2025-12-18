# Community Finance Tracker App – Product Requirements Document (PRD)

## Purpose
Provide a secure and user-friendly platform for a small community to manage financial contributions, debts, and balances, with administrative tools for oversight and communication.

---

## Target Users
- **Community Members**: Register, view financial history, manage their profile.
- **Administrators**: Manage users, contributions, debts, categories, and notifications.

---

## Technology Stack
- **Frontend**: Angular(version 20) with Ionic Framework (responsive web + mobile UI + match angular version)
- **Backend**: C# dotnet(version 10)
- **Database**: SQLite (lightweight, file-based database)
- **Authentication**: OAuth2 for Facebook/Google, JWT for username/password
- **Hosting**: Cloud-based (Azure)

---

## Key Features

### 1. User Registration & Authentication
- Register via:
  - Username and password
  - Facebook login
  - Google login
- Secure authentication and session management

### 2. User Dashboard
- View contribution history (monetary values)
- View current debt
- View balance (contributions – debts)
- Summary of total money received and individual balances

### 3. Profile Management
- Editable fields:
  - First name
  - Last name
  - Email
  - Phone number
  - Address
  - Next of kin
  - Children names (list)
  - Spouse name (wife/husband)
  - Date of birth (**mandatory**)
  - Profile photo
- Admins can edit their own profiles and user profiles

### 4. Contribution & Debt Management
- Admins can:
  - Add/update user contributions
  - Add/update user debts
  - Assign categories to each entry
  - Create new contribution/debt categories

### 5. User Management (Admin Only)
- Add new users manually
- Remove users
- Generate invitation links for registration
  - Each link has an expiration period defined by the admin

### 6. Notifications
- Users receive a monthly notification about their balance
  - Default: First Sunday of each month
  - Admin can configure notification schedule

---

## Data Model Overview (SQLite)

### User
- id (PK)
- first_name
- last_name
- email
- phone_number
- address
- next_of_kin
- children_names (JSON/text array)
- spouse_name
- date_of_birth (mandatory)
- photo
- role (user/admin)
- auth_method (username/password, Facebook, Google)

### Contribution
- id (PK)
- user_id (FK → User)
- amount
- category_id (FK → Category)
- date

### Debt
- id (PK)
- user_id (FK → User)
- amount
- category_id (FK → Category)
- date

### Category
- id (PK)
- name
- type (contribution/debt)

### Invitation
- id (PK)
- token
- expiration_date
- used (boolean)

### Notification
- id (PK)
- user_id (FK → User)
- message
- notification_date
- is_sent (boolean)

---

## Security & Compliance
- HTTPS enforced
- Secure password storage (hashing)
- Role-based access control (User vs Admin)
- Expired invitation links are invalidated automatically

---

## Future Enhancements
- Export financial history to PDF/CSV
- In-app messaging between users and admins
- Multi-language support
- Analytics dashboard for admins

---

## Success Metrics
- Number of active users
- Monthly contribution volume
- Notification delivery rate
- Admin engagement with category and user management

---

## Timeline
- Week 1–2: UI/UX Design (Angular/Ionic)
- Week 3–5: Backend Development (C# + SQLite)
- Week 6–8: Dashboard & Admin Panel Integration
- Week 9–10: Testing & Deployment

---

## Stakeholders
- Community Leaders (Admins)
- Members
- Development Team
- Platform Support Team
