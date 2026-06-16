# ESSS Learning Platform - Backend

NestJS backend API for the ESSS Learning Platform, a comprehensive learning management system built with Clean Architecture principles.

## Features

- **Multi-role User Management** - Support for Students, Instructors, Admins, and Super Admins
- **Hierarchical Course Structure** - Courses → SubCourses → Modules → Content
- **Rich Content Types** - Reading materials, videos, and interactive quizzes
- **Progress Tracking** - Multi-level progress tracking across all content
- **JWT Authentication** - Secure token-based auth with device management
- **Course Subscriptions** - Enrollment and payment tracking
- **Push Notifications** - Firebase integration for real-time updates

## Architecture

This project follows **Clean Architecture** principles with clear separation of concerns:

- **Domain Layer** - Pure business logic, framework-independent
- **Application Layer** - Use cases and application services
- **Infrastructure Layer** - Database, external services, security
- **Presentation Layer** - REST API controllers and DTOs

See [Architecture Documentation](./docs/CLEAN_ARCHITECTURE_STRUCTURE.md) for detailed structure.

## Prerequisites

- Node.js 20+ and npm
- PostgreSQL database (local installation or GCP Cloud SQL)
- Firebase project (for push notifications)
- Supabase account (for file storage only)

## Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Configure the following in `.env`:
   ```env
   # Database - Local PostgreSQL
   DB_HOST="localhost"
   DB_PORT=5432
   DB_USERNAME="postgres"
   DB_PASSWORD="your-password"
   DB_DATABASE="esss_learning"
   DB_DIALECT="postgres"

   # Database - GCP PostgreSQL (Production)
   # DB_HOST="your-gcp-instance-ip"
   # DB_PORT=5432
   # DB_USERNAME="postgres"
   # DB_PASSWORD="your-gcp-password"
   # DB_DATABASE="esss_learning"

   # JWT
   JWT_SECRET="your-secret-key"
   JWT_EXPIRES_IN="15m"
   REFRESH_TOKEN_SECRET="your-refresh-secret"
   REFRESH_TOKEN_EXPIRES_IN="7d"

   # Firebase
   FIREBASE_PROJECT_ID="your-project-id"
   FIREBASE_PRIVATE_KEY="your-private-key"
   FIREBASE_CLIENT_EMAIL="your-client-email"

   # Supabase (Storage only)
   SUPABASE_URL="your-supabase-url"
   SUPABASE_KEY="your-supabase-key"

   # App
   PORT=3000
   NODE_ENV="development"
   ```

4. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb esss_learning

   # Or using psql
   psql -U postgres
   CREATE DATABASE esss_learning;
   \q

   # Run Sequelize migrations
   npx sequelize-cli db:migrate

   # (Optional) Seed the database
   npx sequelize-cli db:seed:all
   ```

## Development

### Start the development server

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

### API Documentation

Once the server is running, access Swagger documentation at:
```
http://localhost:3000/api/docs
```

### Database Management

```bash
# Create a new migration
npx sequelize-cli migration:generate --name migration_name

# Run migrations
npx sequelize-cli db:migrate

# Undo last migration
npx sequelize-cli db:migrate:undo

# Reset database (WARNING: deletes all data)
npx sequelize-cli db:migrate:undo:all

# Create a seeder
npx sequelize-cli seed:generate --name demo-data

# Run all seeders
npx sequelize-cli db:seed:all

# Undo last seeder
npx sequelize-cli db:seed:undo
```

### Running Tests

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## Building for Production

```bash
# Build the project
npm run build

# Start production server
npm run start:prod
```

## Project Structure

```
src/
├── core/                    # Business logic (framework-independent)
│   ├── domain/              # Domain models, value objects, repository interfaces
│   ├── application/         # Use cases, DTOs, application services
│   └── shared/              # Shared core utilities
├── infrastructure/          # External dependencies
│   ├── database/            # Sequelize models, entities, repositories, mappers
│   │   ├── config/          # Database configuration
│   │   ├── entities/        # Sequelize models
│   │   ├── migrations/      # Database migrations
│   │   └── seeders/         # Database seeders
│   ├── config/              # Application configuration
│   ├── security/            # Auth guards, strategies, JWT
│   └── external-services/   # Firebase, storage, email
├── presentation/            # API layer
│   └── http/                # REST controllers, DTOs, validators
├── modules/                 # NestJS modules (dependency injection)
├── app.module.ts            # Root module
└── main.ts                  # Application entry point
```

## Technology Stack

- **Framework**: NestJS 10+
- **Language**: TypeScript 5+
- **Database**: PostgreSQL (local & GCP Cloud SQL)
- **ORM**: Sequelize with sequelize-typescript
- **Authentication**: JWT (Passport.js)
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest, Supertest
- **Push Notifications**: Firebase Admin SDK
- **File Storage**: Supabase Storage

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout

### Users
- `GET /users` - List users (admin only)
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Courses
- `GET /courses` - List all courses
- `GET /courses/:id` - Get course details
- `POST /courses` - Create course (instructor/admin)
- `PUT /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course

### Subscriptions
- `POST /subscriptions/enroll` - Enroll in a course
- `GET /subscriptions/my-courses` - Get student's courses
- `PUT /subscriptions/:id/payment` - Mark subscription as paid

### Progress
- `GET /progress/course/:courseId` - Get course progress
- `POST /progress/content/:contentId/complete` - Mark content as complete
- `GET /progress/dashboard` - Get student dashboard data

See Swagger documentation for complete API reference.

## Development Guidelines

### Adding a New Feature

1. **Define domain models** in `core/domain/models/`
2. **Create repository interface** in `core/domain/repositories/`
3. **Implement use case** in `core/application/use-cases/`
4. **Create repository implementation** in `infrastructure/database/repositories/`
5. **Add mapper** in `infrastructure/database/mappers/`
6. **Create controller** in `presentation/http/controllers/`
7. **Wire module** in `modules/`

### Code Conventions

- Use TypeScript strict mode
- Follow Clean Architecture dependency rules
- Write tests for all use cases
- Use DTOs for all API inputs/outputs
- Validate all user inputs
- Handle errors with custom exceptions
- Document APIs with Swagger decorators

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DB_HOST` | PostgreSQL host | Yes |
| `DB_PORT` | PostgreSQL port | Yes |
| `DB_USERNAME` | PostgreSQL username | Yes |
| `DB_PASSWORD` | PostgreSQL password | Yes |
| `DB_DATABASE` | Database name | Yes |
| `DB_DIALECT` | Database dialect (postgres) | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `JWT_EXPIRES_IN` | Access token expiration | Yes |
| `REFRESH_TOKEN_SECRET` | Secret for refresh tokens | Yes |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token expiration | Yes |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `FIREBASE_PRIVATE_KEY` | Firebase private key | Yes |
| `FIREBASE_CLIENT_EMAIL` | Firebase client email | Yes |
| `SUPABASE_URL` | Supabase project URL (storage) | Yes |
| `SUPABASE_KEY` | Supabase API key (storage) | Yes |
| `PORT` | Server port | No (default: 3000) |
| `NODE_ENV` | Environment | No (default: development) |

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
psql -U postgres

# Verify database credentials in .env
# Ensure database exists
createdb esss_learning

# Test connection
psql -U postgres -d esss_learning
```

### Sequelize Issues
```bash
# Re-run migrations
npx sequelize-cli db:migrate

# Check migration status
npx sequelize-cli db:migrate:status

# Reset database (careful!)
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:migrate
```

### Port Already in Use
```bash
# Change PORT in .env
# Or kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

## License

Private project

## Related Projects

- [Learners Portal](../learners_portal) - Next.js student-facing app
- [Admin Portal](../admin_portal) - Nuxt.js admin interface
