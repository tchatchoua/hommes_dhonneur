# Community Finance Tracker

A comprehensive community finance management application built with Angular 19/Ionic 8 frontend and ASP.NET Core 9.0 backend.

## Features

### User Features
- **Authentication**: Login/Register with email or OAuth (Google/Facebook)
- **Dashboard**: Financial overview with contribution and debt summaries
- **Contributions**: Track and manage personal contributions
- **Debts**: Monitor and manage outstanding debts
- **Profile**: Update personal information and notification preferences

### Admin Features
- **User Management**: View, edit, and manage community members
- **Categories**: Create and manage contribution categories
- **Invitations**: Send and manage invitation links
- **Notifications**: Send notifications to users

## Tech Stack

### Backend
- **Framework**: ASP.NET Core 9.0
- **ORM**: Entity Framework Core 9.0
- **Database**: SQLite (configurable)
- **Authentication**: JWT Bearer tokens
- **Logging**: Serilog
- **Validation**: FluentValidation
- **Mapping**: AutoMapper
- **API Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: Angular 19
- **UI Framework**: Ionic 8
- **State Management**: Angular Signals
- **HTTP Client**: Angular HttpClient with interceptors
- **Styling**: SCSS with Ionic theming

## Project Structure

```
Les-Hommes/
├── backend/
│   └── CommunityFinanceTracker/
│       ├── Configuration/       # App settings classes
│       ├── Controllers/         # API endpoints
│       ├── Data/               # Database context
│       ├── Mappings/           # AutoMapper profiles
│       ├── Middleware/         # Custom middleware
│       ├── Models/
│       │   ├── DTOs/           # Data transfer objects
│       │   └── Entities/       # Domain models
│       ├── Repositories/       # Data access layer
│       ├── Services/           # Business logic
│       └── Validators/         # Request validators
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── core/           # Guards, interceptors, services
│       │   └── features/       # Feature modules (pages)
│       ├── environments/       # Environment configs
│       └── theme/              # Global styles
└── prd.md                      # Product requirements
```

## Getting Started

### Prerequisites

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 20+](https://nodejs.org/)
- [Ionic CLI](https://ionicframework.com/docs/cli)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend/CommunityFinanceTracker
   ```

2. Restore NuGet packages:
   ```bash
   dotnet restore
   ```

3. Update the database:
   ```bash
   dotnet ef database update
   ```

4. Run the application:
   ```bash
   dotnet run
   ```

The API will be available at `https://localhost:7001` and Swagger UI at `https://localhost:7001/swagger`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:4200`.

## Configuration

### Backend Configuration

Update `appsettings.json` or `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=community_finance.db"
  },
  "JwtSettings": {
    "SecretKey": "your-secret-key-at-least-32-characters",
    "Issuer": "CommunityFinanceTracker",
    "Audience": "CommunityFinanceTracker",
    "ExpirationMinutes": 60
  },
  "OAuthSettings": {
    "Google": {
      "ClientId": "your-google-client-id",
      "ClientSecret": "your-google-client-secret"
    },
    "Facebook": {
      "AppId": "your-facebook-app-id",
      "AppSecret": "your-facebook-app-secret"
    }
  }
}
```

### Frontend Configuration

Update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7001/api'
};
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/oauth/{provider}` - OAuth login
- `POST /api/auth/validate-invitation` - Validate invitation token

### Users
- `GET /api/users` - List users (Admin)
- `GET /api/users/{id}` - Get user details
- `PUT /api/users/{id}` - Update user
- `PUT /api/users/{id}/role` - Update user role (Admin)
- `DELETE /api/users/{id}` - Delete user (Admin)

### Contributions
- `GET /api/contributions` - List contributions
- `GET /api/contributions/my` - List current user's contributions
- `POST /api/contributions` - Create contribution
- `PUT /api/contributions/{id}` - Update contribution
- `DELETE /api/contributions/{id}` - Delete contribution

### Debts
- `GET /api/debts` - List debts
- `GET /api/debts/my` - List current user's debts
- `POST /api/debts` - Create debt
- `PUT /api/debts/{id}` - Update debt
- `PUT /api/debts/{id}/status` - Update debt status
- `DELETE /api/debts/{id}` - Delete debt

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/{id}` - Update category (Admin)
- `DELETE /api/categories/{id}` - Delete category (Admin)

### Invitations
- `GET /api/invitations` - List invitations (Admin)
- `POST /api/invitations` - Create invitation (Admin)
- `DELETE /api/invitations/{id}` - Delete invitation (Admin)

### Notifications
- `GET /api/notifications` - List current user's notifications
- `GET /api/notifications/all` - List all notifications (Admin)
- `POST /api/notifications` - Send notification (Admin)
- `PUT /api/notifications/{id}/read` - Mark notification as read
- `GET /api/notifications/settings` - Get notification settings
- `PUT /api/notifications/settings` - Update notification settings

## Development

### Running Tests

Backend:
```bash
cd backend/CommunityFinanceTracker
dotnet test
```

Frontend:
```bash
cd frontend
npm test
```

### Building for Production

Backend:
```bash
cd backend/CommunityFinanceTracker
dotnet publish -c Release
```

Frontend:
```bash
cd frontend
npm run build
```

## License

This project is proprietary software for community use.

## Support

For support, please contact the community administrators.
