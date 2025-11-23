# ESSS Learning Platform - Backend Implementation Plan

This document outlines the complete implementation plan for the NestJS backend following Clean Architecture principles.

## Project Setup

### Step 1: Initialize NestJS Project

```bash
# Install NestJS CLI globally (if not already installed)
npm install -g @nestjs/cli

# Initialize project (if starting fresh)
# nest new backend --skip-git

# Or if already in backend directory
npm init -y
```

### Step 2: Install Core Dependencies

```bash
# NestJS Core
npm install @nestjs/common @nestjs/core @nestjs/platform-express

# Database & ORM
npm install @nestjs/sequelize sequelize sequelize-typescript
npm install pg pg-hstore
npm install -D @types/sequelize sequelize-cli

# Authentication
npm install @nestjs/passport @nestjs/jwt passport passport-jwt
npm install bcrypt
npm install -D @types/bcrypt @types/passport-jwt

# Validation
npm install class-validator class-transformer

# Configuration
npm install @nestjs/config

# API Documentation
npm install @nestjs/swagger swagger-ui-express

# Firebase (Push Notifications)
npm install firebase-admin

# Supabase (Storage)
npm install @supabase/supabase-js

# Testing
npm install -D @nestjs/testing jest @types/jest ts-jest supertest @types/supertest

# Utilities
npm install uuid
npm install -D @types/uuid
```

### Step 3: Project Configuration Files

Create the following configuration files:

- [ ] `tsconfig.json` - TypeScript configuration
- [ ] `nest-cli.json` - NestJS CLI configuration
- [ ] `jest.config.js` - Jest testing configuration
- [ ] `.eslintrc.js` - ESLint configuration
- [ ] `.prettierrc` - Prettier configuration
- [ ] `.env.example` - Environment variables template

### Step 4: Create Folder Structure

Create the complete Clean Architecture folder structure:

```bash
# Core Layer
mkdir -p src/core/domain/{models,value-objects,enums,exceptions,repositories}
mkdir -p src/core/application/{ports,use-cases,dto,services}
mkdir -p src/core/shared/{types,constants,utils}

# Infrastructure Layer
mkdir -p src/infrastructure/database/{config,entities,repositories,mappers,migrations,seeders}
mkdir -p src/infrastructure/config
mkdir -p src/infrastructure/security/{guards,strategies,decorators,services}
mkdir -p src/infrastructure/external-services/{firebase,storage,email}
mkdir -p src/infrastructure/persistence

# Presentation Layer
mkdir -p src/presentation/http/{controllers,dto,validators,interceptors,filters,pipes,middleware,swagger}

# Modules
mkdir -p src/modules/{auth,users,courses,sub-courses,modules,content,subscriptions,progress}

# Testing
mkdir -p test/{e2e,integration,fixtures,helpers}

# Documentation
mkdir -p docs/{architecture,api,database,deployment}
```

### Step 5: Initialize Sequelize

```bash
# Initialize Sequelize
npx sequelize-cli init

# This creates:
# - config/config.json (move to src/infrastructure/database/config/)
# - models/ (we'll use our own structure)
# - migrations/
# - seeders/

# Create .sequelizerc file in project root to configure paths
```

### Step 6: Setup Environment Variables

Create `.env` file with:

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
JWT_SECRET="your-jwt-secret-key-change-in-production"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_SECRET="your-refresh-token-secret-change-in-production"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Firebase
FIREBASE_PROJECT_ID=""
FIREBASE_PRIVATE_KEY=""
FIREBASE_CLIENT_EMAIL=""

# Supabase (for storage only)
SUPABASE_URL=""
SUPABASE_KEY=""

# App
PORT=3000
NODE_ENV="development"
```

---

## Phase 1: Foundation (Weeks 1-2)

### Goal: Setup project infrastructure and authentication

### 1.1 Sequelize Models Setup

- [ ] Create `.sequelizerc` configuration file
- [ ] Configure database connection in `src/infrastructure/database/config/database.config.ts`
- [ ] Define Sequelize models for all entities:
  - User (base model)
  - Student, Instructor, Admin, SuperAdmin (role-specific)
  - RefreshToken, DeviceToken
  - Course, SubCourse, Module
  - ReadingMaterial, ModuleVideo, Quiz, Question
  - Subscription
  - Progress entities (CourseProgress, SubCourseProgress, etc.)
- [ ] Create initial migration: `npx sequelize-cli migration:generate --name init-database`
- [ ] Run migrations: `npx sequelize-cli db:migrate`

### 1.2 Core Domain Layer - User Domain

**Create domain models** (no framework dependencies!):

- [ ] `src/core/domain/models/user/user.model.ts`
- [ ] `src/core/domain/models/user/student.model.ts`
- [ ] `src/core/domain/models/user/instructor.model.ts`
- [ ] `src/core/domain/models/user/admin.model.ts`
- [ ] `src/core/domain/models/user/super-admin.model.ts`

**Create value objects**:

- [ ] `src/core/domain/value-objects/email.vo.ts`
- [ ] `src/core/domain/value-objects/password.vo.ts`
- [ ] `src/core/domain/value-objects/phone-number.vo.ts`

**Create enums**:

- [ ] `src/core/domain/enums/user-role.enum.ts`
- [ ] `src/core/domain/enums/gender.enum.ts`
- [ ] `src/core/domain/enums/student-level.enum.ts`

**Create exceptions**:

- [ ] `src/core/domain/exceptions/domain.exception.ts` (base)
- [ ] `src/core/domain/exceptions/user-not-found.exception.ts`
- [ ] `src/core/domain/exceptions/invalid-credentials.exception.ts`
- [ ] `src/core/domain/exceptions/unauthorized-access.exception.ts`

**Create repository interfaces**:

- [ ] `src/core/domain/repositories/base-repository.interface.ts`
- [ ] `src/core/domain/repositories/user.repository.interface.ts`
- [ ] `src/core/domain/repositories/refresh-token.repository.interface.ts`
- [ ] `src/core/domain/repositories/device-token.repository.interface.ts`

### 1.3 Application Layer - Auth Use Cases

**Create ports**:

- [ ] `src/core/application/ports/output/hash.service.interface.ts`
- [ ] `src/core/application/ports/output/token.service.interface.ts`

**Create DTOs**:

- [ ] `src/core/application/dto/auth/login-request.dto.ts`
- [ ] `src/core/application/dto/auth/login-response.dto.ts`
- [ ] `src/core/application/dto/auth/register-request.dto.ts`
- [ ] `src/core/application/dto/auth/register-response.dto.ts`
- [ ] `src/core/application/dto/auth/refresh-token-request.dto.ts`
- [ ] `src/core/application/dto/auth/refresh-token-response.dto.ts`

**Create use cases**:

- [ ] `src/core/application/use-cases/auth/login.use-case.ts`
- [ ] `src/core/application/use-cases/auth/register.use-case.ts`
- [ ] `src/core/application/use-cases/auth/refresh-token.use-case.ts`
- [ ] `src/core/application/use-cases/auth/logout.use-case.ts`
- [ ] `src/core/application/use-cases/auth/revoke-all-tokens.use-case.ts`

### 1.4 Infrastructure Layer - Auth Implementation

**Database entities**:

- [ ] `src/infrastructure/database/entities/user/user.entity.ts`
- [ ] `src/infrastructure/database/entities/auth/refresh-token.entity.ts`
- [ ] `src/infrastructure/database/entities/auth/device-token.entity.ts`

**Repositories**:

- [ ] `src/infrastructure/database/repositories/base/base.repository.ts`
- [ ] `src/infrastructure/database/repositories/user/user.repository.ts`
- [ ] `src/infrastructure/database/repositories/auth/refresh-token.repository.ts`
- [ ] `src/infrastructure/database/repositories/auth/device-token.repository.ts`

**Mappers**:

- [ ] `src/infrastructure/database/mappers/user.mapper.ts`
- [ ] `src/infrastructure/database/mappers/refresh-token.mapper.ts`
- [ ] `src/infrastructure/database/mappers/device-token.mapper.ts`

**Security services**:

- [ ] `src/infrastructure/security/services/hash.service.ts` (bcrypt)
- [ ] `src/infrastructure/security/services/token.service.ts` (JWT)

**Guards & Strategies**:

- [ ] `src/infrastructure/security/strategies/jwt.strategy.ts`
- [ ] `src/infrastructure/security/strategies/refresh-token.strategy.ts`
- [ ] `src/infrastructure/security/guards/jwt-auth.guard.ts`
- [ ] `src/infrastructure/security/guards/roles.guard.ts`

**Decorators**:

- [ ] `src/infrastructure/security/decorators/roles.decorator.ts`
- [ ] `src/infrastructure/security/decorators/current-user.decorator.ts`
- [ ] `src/infrastructure/security/decorators/public.decorator.ts`

**Configuration**:

- [ ] `src/infrastructure/config/env/env.config.ts`
- [ ] `src/infrastructure/config/env/env.validation.ts`
- [ ] `src/infrastructure/config/jwt.config.ts`
- [ ] `src/infrastructure/config/database.config.ts`

### 1.5 Presentation Layer - Auth API

**Controllers**:

- [ ] `src/presentation/http/controllers/auth/auth.controller.ts`

**HTTP DTOs** (with validation decorators):

- [ ] `src/presentation/http/dto/auth/login-request.dto.ts`
- [ ] `src/presentation/http/dto/auth/register-request.dto.ts`
- [ ] `src/presentation/http/dto/auth/refresh-token-request.dto.ts`

**Filters**:

- [ ] `src/presentation/http/filters/http-exception.filter.ts`
- [ ] `src/presentation/http/filters/domain-exception.filter.ts`
- [ ] `src/presentation/http/filters/all-exceptions.filter.ts`

**Interceptors**:

- [ ] `src/presentation/http/interceptors/transform.interceptor.ts`
- [ ] `src/presentation/http/interceptors/logging.interceptor.ts`

**Pipes**:

- [ ] `src/presentation/http/pipes/validation.pipe.ts`

### 1.6 Module Wiring

- [ ] `src/infrastructure/database/database.module.ts` (configure SequelizeModule)
- [ ] `src/infrastructure/database/database.providers.ts`
- [ ] `src/infrastructure/security/security.module.ts`
- [ ] `src/modules/auth/auth.module.ts`
- [ ] `src/modules/users/users.module.ts`
- [ ] `src/app.module.ts`
- [ ] `src/main.ts`

### 1.7 User Management

**Use cases**:

- [ ] `src/core/application/use-cases/users/create-user.use-case.ts`
- [ ] `src/core/application/use-cases/users/get-user.use-case.ts`
- [ ] `src/core/application/use-cases/users/update-user.use-case.ts`
- [ ] `src/core/application/use-cases/users/delete-user.use-case.ts`
- [ ] `src/core/application/use-cases/users/list-users.use-case.ts`
- [ ] `src/core/application/use-cases/users/assign-role.use-case.ts`

**Controllers**:

- [ ] `src/presentation/http/controllers/users/users.controller.ts`

### 1.8 Testing & Documentation

- [ ] Setup Swagger documentation
- [ ] Write unit tests for auth use cases
- [ ] Write E2E tests for auth endpoints
- [ ] Test user CRUD operations

---

## Phase 2: Core Features (Weeks 3-5)

### Goal: Implement course management and content delivery

### 2.1 Course Domain

**Domain models**:

- [ ] `src/core/domain/models/course/course.model.ts`
- [ ] `src/core/domain/models/course/sub-course.model.ts`
- [ ] `src/core/domain/models/course/module.model.ts`
- [ ] `src/core/domain/models/course/subscription.model.ts`

**Value objects**:

- [ ] `src/core/domain/value-objects/percentage.vo.ts`

**Enums**:

- [ ] `src/core/domain/enums/course-level.enum.ts`
- [ ] `src/core/domain/enums/course-category.enum.ts`

**Exceptions**:

- [ ] `src/core/domain/exceptions/course-not-found.exception.ts`
- [ ] `src/core/domain/exceptions/subscription-not-found.exception.ts`

**Repository interfaces**:

- [ ] `src/core/domain/repositories/course.repository.interface.ts`
- [ ] `src/core/domain/repositories/sub-course.repository.interface.ts`
- [ ] `src/core/domain/repositories/module.repository.interface.ts`
- [ ] `src/core/domain/repositories/subscription.repository.interface.ts`

### 2.2 Course Use Cases

- [ ] `src/core/application/use-cases/courses/create-course.use-case.ts`
- [ ] `src/core/application/use-cases/courses/get-course.use-case.ts`
- [ ] `src/core/application/use-cases/courses/update-course.use-case.ts`
- [ ] `src/core/application/use-cases/courses/delete-course.use-case.ts`
- [ ] `src/core/application/use-cases/courses/list-courses.use-case.ts`
- [ ] `src/core/application/use-cases/courses/get-course-by-instructor.use-case.ts`

**SubCourse use cases**:

- [ ] `src/core/application/use-cases/sub-courses/create-sub-course.use-case.ts`
- [ ] `src/core/application/use-cases/sub-courses/get-sub-course.use-case.ts`
- [ ] `src/core/application/use-cases/sub-courses/update-sub-course.use-case.ts`
- [ ] `src/core/application/use-cases/sub-courses/delete-sub-course.use-case.ts`
- [ ] `src/core/application/use-cases/sub-courses/list-sub-courses.use-case.ts`

**Module use cases**:

- [ ] `src/core/application/use-cases/modules/create-module.use-case.ts`
- [ ] `src/core/application/use-cases/modules/get-module.use-case.ts`
- [ ] `src/core/application/use-cases/modules/update-module.use-case.ts`
- [ ] `src/core/application/use-cases/modules/delete-module.use-case.ts`
- [ ] `src/core/application/use-cases/modules/list-modules.use-case.ts`

### 2.3 Course Infrastructure

**Entities**:

- [ ] `src/infrastructure/database/entities/course/course.entity.ts`
- [ ] `src/infrastructure/database/entities/course/sub-course.entity.ts`
- [ ] `src/infrastructure/database/entities/course/module.entity.ts`
- [ ] `src/infrastructure/database/entities/course/subscription.entity.ts`

**Repositories**:

- [ ] `src/infrastructure/database/repositories/course/course.repository.ts`
- [ ] `src/infrastructure/database/repositories/course/sub-course.repository.ts`
- [ ] `src/infrastructure/database/repositories/course/module.repository.ts`
- [ ] `src/infrastructure/database/repositories/course/subscription.repository.ts`

**Mappers**:

- [ ] `src/infrastructure/database/mappers/course.mapper.ts`
- [ ] `src/infrastructure/database/mappers/sub-course.mapper.ts`
- [ ] `src/infrastructure/database/mappers/module.mapper.ts`
- [ ] `src/infrastructure/database/mappers/subscription.mapper.ts`

### 2.4 Course Presentation

**Controllers**:

- [ ] `src/presentation/http/controllers/courses/courses.controller.ts`
- [ ] `src/presentation/http/controllers/sub-courses/sub-courses.controller.ts`
- [ ] `src/presentation/http/controllers/modules/modules.controller.ts`

**Guards**:

- [ ] `src/infrastructure/security/guards/subscription.guard.ts` (check enrollment)

### 2.5 Content Domain

**Domain models**:

- [ ] `src/core/domain/models/content/reading-material.model.ts`
- [ ] `src/core/domain/models/content/module-video.model.ts`
- [ ] `src/core/domain/models/content/quiz.model.ts`
- [ ] `src/core/domain/models/content/question.model.ts`

**Value objects**:

- [ ] `src/core/domain/value-objects/content-json.vo.ts`

**Exceptions**:

- [ ] `src/core/domain/exceptions/content-not-found.exception.ts`

**Repository interfaces**:

- [ ] `src/core/domain/repositories/reading-material.repository.interface.ts`
- [ ] `src/core/domain/repositories/module-video.repository.interface.ts`
- [ ] `src/core/domain/repositories/quiz.repository.interface.ts`
- [ ] `src/core/domain/repositories/question.repository.interface.ts`

### 2.6 Content Use Cases

**Reading materials**:

- [ ] `src/core/application/use-cases/content/reading-materials/create-reading-material.use-case.ts`
- [ ] `src/core/application/use-cases/content/reading-materials/get-reading-material.use-case.ts`
- [ ] `src/core/application/use-cases/content/reading-materials/update-reading-material.use-case.ts`
- [ ] `src/core/application/use-cases/content/reading-materials/delete-reading-material.use-case.ts`

**Videos**:

- [ ] `src/core/application/use-cases/content/videos/create-video.use-case.ts`
- [ ] `src/core/application/use-cases/content/videos/get-video.use-case.ts`
- [ ] `src/core/application/use-cases/content/videos/update-video.use-case.ts`
- [ ] `src/core/application/use-cases/content/videos/delete-video.use-case.ts`

**Quizzes**:

- [ ] `src/core/application/use-cases/content/quizzes/create-quiz.use-case.ts`
- [ ] `src/core/application/use-cases/content/quizzes/get-quiz.use-case.ts`
- [ ] `src/core/application/use-cases/content/quizzes/update-quiz.use-case.ts`
- [ ] `src/core/application/use-cases/content/quizzes/delete-quiz.use-case.ts`
- [ ] `src/core/application/use-cases/content/quizzes/submit-quiz.use-case.ts`

### 2.7 Content Infrastructure & Presentation

**Entities, Repositories, Mappers** (same pattern as above)

**Controllers**:

- [ ] `src/presentation/http/controllers/content/reading-materials.controller.ts`
- [ ] `src/presentation/http/controllers/content/videos.controller.ts`
- [ ] `src/presentation/http/controllers/content/quizzes.controller.ts`

### 2.8 Subscription System

**Use cases**:

- [ ] `src/core/application/use-cases/subscriptions/enroll-student.use-case.ts`
- [ ] `src/core/application/use-cases/subscriptions/unenroll-student.use-case.ts`
- [ ] `src/core/application/use-cases/subscriptions/check-enrollment.use-case.ts`
- [ ] `src/core/application/use-cases/subscriptions/get-student-courses.use-case.ts`
- [ ] `src/core/application/use-cases/subscriptions/get-course-students.use-case.ts`
- [ ] `src/core/application/use-cases/subscriptions/mark-as-paid.use-case.ts`

**Controller**:

- [ ] `src/presentation/http/controllers/subscriptions/subscriptions.controller.ts`

### 2.9 Module Wiring

- [ ] `src/modules/courses/courses.module.ts`
- [ ] `src/modules/sub-courses/sub-courses.module.ts`
- [ ] `src/modules/modules/modules.module.ts`
- [ ] `src/modules/content/content.module.ts`
- [ ] `src/modules/subscriptions/subscriptions.module.ts`

### 2.10 Testing

- [ ] Unit tests for course use cases
- [ ] Unit tests for content use cases
- [ ] E2E tests for course management
- [ ] E2E tests for enrollment

---

## Phase 3: Progress Tracking (Weeks 6-7)

### Goal: Implement multi-level progress tracking

### 3.1 Progress Domain

**Domain models**:

- [ ] `src/core/domain/models/progress/course-progress.model.ts`
- [ ] `src/core/domain/models/progress/sub-course-progress.model.ts`
- [ ] `src/core/domain/models/progress/module-progress.model.ts`
- [ ] `src/core/domain/models/progress/reading-progress.model.ts`
- [ ] `src/core/domain/models/progress/video-progress.model.ts`
- [ ] `src/core/domain/models/progress/quiz-progress.model.ts`
- [ ] `src/core/domain/models/progress/question-progress.model.ts`

**Repository interfaces**:

- [ ] `src/core/domain/repositories/course-progress.repository.interface.ts`
- [ ] `src/core/domain/repositories/sub-course-progress.repository.interface.ts`
- [ ] `src/core/domain/repositories/module-progress.repository.interface.ts`
- [ ] `src/core/domain/repositories/reading-progress.repository.interface.ts`
- [ ] `src/core/domain/repositories/video-progress.repository.interface.ts`
- [ ] `src/core/domain/repositories/quiz-progress.repository.interface.ts`
- [ ] `src/core/domain/repositories/question-progress.repository.interface.ts`

### 3.2 Progress Use Cases

- [ ] `src/core/application/use-cases/progress/track-course-progress.use-case.ts`
- [ ] `src/core/application/use-cases/progress/track-sub-course-progress.use-case.ts`
- [ ] `src/core/application/use-cases/progress/track-module-progress.use-case.ts`
- [ ] `src/core/application/use-cases/progress/mark-reading-complete.use-case.ts`
- [ ] `src/core/application/use-cases/progress/mark-video-complete.use-case.ts`
- [ ] `src/core/application/use-cases/progress/mark-quiz-complete.use-case.ts`
- [ ] `src/core/application/use-cases/progress/save-question-answer.use-case.ts`
- [ ] `src/core/application/use-cases/progress/get-student-progress.use-case.ts`
- [ ] `src/core/application/use-cases/progress/get-course-progress.use-case.ts`
- [ ] `src/core/application/use-cases/progress/calculate-progress.use-case.ts`

### 3.3 Domain Services

- [ ] `src/core/application/services/progress-calculator.service.ts`
- [ ] `src/core/application/services/enrollment-validator.service.ts`
- [ ] `src/core/application/services/course-hierarchy.service.ts`

### 3.4 Progress Infrastructure

**Entities, Repositories, Mappers** (follow same pattern)

**Transaction support**:

- [ ] `src/infrastructure/persistence/transaction.decorator.ts`
- [ ] `src/infrastructure/persistence/unit-of-work.service.ts`

### 3.5 Progress Presentation

- [ ] `src/presentation/http/controllers/progress/progress.controller.ts`

### 3.6 Module Wiring

- [ ] `src/modules/progress/progress.module.ts`

### 3.7 Testing

- [ ] Unit tests for progress calculation
- [ ] Integration tests for progress tracking
- [ ] E2E tests for progress APIs

---

## Phase 4: Enhancements (Weeks 8-9)

### Goal: Add notifications, file uploads, and admin features

### 4.1 Firebase Notifications

**Port interfaces**:

- [ ] `src/core/application/ports/output/notification.service.interface.ts`
- [ ] `src/core/application/ports/output/firebase.service.interface.ts`

**Infrastructure**:

- [ ] `src/infrastructure/config/firebase.config.ts`
- [ ] `src/infrastructure/external-services/firebase/firebase.service.ts`
- [ ] `src/infrastructure/external-services/firebase/firebase-messaging.service.ts`
- [ ] `src/infrastructure/external-services/firebase/firebase.module.ts`

### 4.2 File Storage

**Port interface**:

- [ ] `src/core/application/ports/output/storage.service.interface.ts`

**Infrastructure**:

- [ ] `src/infrastructure/config/storage.config.ts`
- [ ] `src/infrastructure/external-services/storage/storage.service.ts`
- [ ] `src/infrastructure/external-services/storage/supabase-storage.service.ts`
- [ ] `src/infrastructure/external-services/storage/storage.module.ts`

**File upload endpoints**:

- [ ] Add file upload to course creation
- [ ] Add file upload to content creation
- [ ] Handle video thumbnails
- [ ] Handle profile pictures

### 4.3 Email Service (Optional)

**Port interface**:

- [ ] `src/core/application/ports/output/email.service.interface.ts`

**Infrastructure**:

- [ ] `src/infrastructure/external-services/email/email.service.ts`
- [ ] `src/infrastructure/external-services/email/email.module.ts`

### 4.4 Admin Features

- [ ] Admin dashboard statistics API
- [ ] User analytics endpoints
- [ ] Course analytics endpoints
- [ ] Revenue/payment tracking
- [ ] Bulk operations (bulk user creation, etc.)

### 4.5 WebSockets (Optional)

- [ ] `src/presentation/websockets/gateways/notifications.gateway.ts`
- [ ] `src/presentation/websockets/gateways/progress.gateway.ts`
- [ ] `src/presentation/websockets/websockets.module.ts`

### 4.6 Testing

- [ ] Test file uploads
- [ ] Test push notifications
- [ ] Test email sending

---

## Phase 5: Polish (Week 10)

### Goal: Testing, documentation, and optimization

### 5.1 Comprehensive Testing

- [ ] Complete unit test coverage (>80%)
- [ ] Complete E2E test suite
- [ ] Integration tests for all repositories
- [ ] Load testing with sample data

### 5.2 Documentation

- [ ] Complete Swagger/OpenAPI documentation
- [ ] API endpoint documentation
- [ ] Database schema documentation
- [ ] Deployment guide
- [ ] Environment variables documentation
- [ ] Architecture diagrams

### 5.3 Performance Optimization

- [ ] Add database indexes
- [ ] Optimize N+1 queries
- [ ] Add caching strategy (Redis optional)
- [ ] Optimize progress calculation
- [ ] Add pagination to all list endpoints

### 5.4 Security Hardening

- [ ] Rate limiting
- [ ] CORS configuration
- [ ] Helmet.js security headers
- [ ] Input sanitization
- [ ] SQL injection prevention
- [ ] XSS prevention

### 5.5 Error Handling & Logging

- [ ] Structured logging
- [ ] Error tracking setup
- [ ] Request/response logging
- [ ] Performance monitoring

### 5.6 Database Seeding

- [ ] Create seeders using Sequelize CLI
- [ ] `npx sequelize-cli seed:generate --name demo-users`
- [ ] `npx sequelize-cli seed:generate --name demo-courses`
- [ ] Sample users (all roles)
- [ ] Sample courses with content
- [ ] Sample progress data
- [ ] Run seeds: `npx sequelize-cli db:seed:all`

---

## Architecture Principles (CRITICAL!)

### ✅ DO

- Keep domain logic in domain layer
- Use interfaces for all dependencies
- Use dependency injection everywhere
- Write tests for all use cases
- Use DTOs for all data transfer
- Map between layers (entities ↔ models)
- Use transactions for multi-step operations
- Validate all user inputs
- Handle all errors gracefully

### ❌ DON'T

- Import NestJS/framework code in domain layer
- Import infrastructure in domain/application layers
- Put business logic in controllers
- Use database entities in use cases
- Skip mappers between layers
- Tightly couple layers
- Use any types
- Expose internal errors to API

---

## Dependency Flow Rules

```
Presentation Layer (Controllers, DTOs)
        ↓ depends on
Application Layer (Use Cases, Ports)
        ↓ depends on
Domain Layer (Models, Repositories Interfaces)
        ↑ implements
Infrastructure Layer (DB, Repositories, External APIs)
```

**Rules**:
1. Domain Layer: NO dependencies on other layers
2. Application Layer: Depends ONLY on Domain
3. Infrastructure: Implements Domain interfaces
4. Presentation: Depends on Application

---

## Checklist Before Each Phase

- [ ] All previous phase tasks completed
- [ ] Tests passing for previous phase
- [ ] Code reviewed and refactored
- [ ] Documentation updated
- [ ] No breaking changes introduced
- [ ] Database migrations created and tested
- [ ] Environment variables documented

---

## Success Criteria

### Phase 1 Complete When:
- Users can register and login
- JWT authentication working
- Role-based access control implemented
- User CRUD operations functional

### Phase 2 Complete When:
- Courses can be created and managed
- Content can be added to modules
- Students can enroll in courses
- Content is accessible to enrolled students

### Phase 3 Complete When:
- Progress tracking works at all levels
- Progress calculations are accurate
- Dashboard APIs return correct data
- Progress persists correctly

### Phase 4 Complete When:
- Push notifications send successfully
- File uploads work for all content types
- Admin APIs provide necessary functionality

### Phase 5 Complete When:
- Test coverage >80%
- All documentation complete
- Performance benchmarks met
- Security audit passed
- Ready for deployment

---

## Notes

- Follow the Clean Architecture structure strictly
- Refer to `docs/CLEAN_ARCHITECTURE_STRUCTURE.md` for detailed folder structure
- Use Prisma for database operations
- Keep use cases focused and single-purpose
- Always map between database entities and domain models
- Write tests alongside implementation
- Document as you build
