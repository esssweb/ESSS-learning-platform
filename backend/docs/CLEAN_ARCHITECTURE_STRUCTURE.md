# Clean Architecture Folder Structure - ESSS Learning Platform

## Complete Detailed Structure

```
backend/
├── src/
│   ├── core/                                    # Core Business Logic (Framework Independent)
│   │   ├── domain/                              # Domain Layer - Business Entities
│   │   │   ├── models/                          # Domain Models (Pure Business Objects)
│   │   │   │   ├── user/
│   │   │   │   │   ├── user.model.ts           # User domain model
│   │   │   │   │   ├── admin.model.ts          # Admin domain model
│   │   │   │   │   ├── instructor.model.ts     # Instructor domain model
│   │   │   │   │   ├── super-admin.model.ts    # SuperAdmin domain model
│   │   │   │   │   ├── student.model.ts        # Student domain model
│   │   │   │   │   └── index.ts                # Barrel export
│   │   │   │   ├── auth/
│   │   │   │   │   ├── device-token.model.ts   # Device token model
│   │   │   │   │   ├── refresh-token.model.ts  # Refresh token model
│   │   │   │   │   └── index.ts
│   │   │   │   ├── course/
│   │   │   │   │   ├── course.model.ts         # Course domain model
│   │   │   │   │   ├── sub-course.model.ts     # SubCourse domain model
│   │   │   │   │   ├── module.model.ts         # Module domain model
│   │   │   │   │   ├── subscription.model.ts   # Subscription domain model
│   │   │   │   │   └── index.ts
│   │   │   │   ├── content/
│   │   │   │   │   ├── reading-material.model.ts  # Reading material model
│   │   │   │   │   ├── module-video.model.ts      # Video model
│   │   │   │   │   ├── quiz.model.ts              # Quiz model
│   │   │   │   │   ├── question.model.ts          # Question model (for quiz)
│   │   │   │   │   └── index.ts
│   │   │   │   ├── progress/
│   │   │   │   │   ├── course-progress.model.ts        # Course progress model
│   │   │   │   │   ├── sub-course-progress.model.ts    # SubCourse progress
│   │   │   │   │   ├── module-progress.model.ts        # Module progress
│   │   │   │   │   ├── reading-progress.model.ts       # Reading material progress
│   │   │   │   │   ├── video-progress.model.ts         # Video progress
│   │   │   │   │   ├── quiz-progress.model.ts          # Quiz progress
│   │   │   │   │   ├── question-progress.model.ts      # Question answer tracking
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts                            # Barrel export all models
│   │   │   │
│   │   │   ├── value-objects/                   # Value Objects (Immutable)
│   │   │   │   ├── email.vo.ts                  # Email value object
│   │   │   │   ├── password.vo.ts               # Password value object
│   │   │   │   ├── phone-number.vo.ts           # Phone number value object
│   │   │   │   ├── percentage.vo.ts             # Progress percentage value object
│   │   │   │   ├── content-json.vo.ts           # Reading content JSON value object
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── enums/                           # Domain Enums
│   │   │   │   ├── user-role.enum.ts            # User role enum
│   │   │   │   ├── gender.enum.ts               # Gender enum
│   │   │   │   ├── student-level.enum.ts        # Student level enum
│   │   │   │   ├── course-level.enum.ts         # Course level enum
│   │   │   │   ├── course-category.enum.ts      # Course category enum
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── exceptions/                      # Domain Exceptions
│   │   │   │   ├── domain.exception.ts          # Base domain exception
│   │   │   │   ├── user-not-found.exception.ts
│   │   │   │   ├── course-not-found.exception.ts
│   │   │   │   ├── unauthorized-access.exception.ts
│   │   │   │   ├── invalid-credentials.exception.ts
│   │   │   │   ├── subscription-not-found.exception.ts
│   │   │   │   ├── content-not-found.exception.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── repositories/                    # Repository Interfaces (Contracts)
│   │   │       ├── base-repository.interface.ts # Base repository interface
│   │   │       ├── user.repository.interface.ts
│   │   │       ├── admin.repository.interface.ts
│   │   │       ├── instructor.repository.interface.ts
│   │   │       ├── super-admin.repository.interface.ts
│   │   │       ├── student.repository.interface.ts
│   │   │       ├── device-token.repository.interface.ts
│   │   │       ├── refresh-token.repository.interface.ts
│   │   │       ├── course.repository.interface.ts
│   │   │       ├── sub-course.repository.interface.ts
│   │   │       ├── module.repository.interface.ts
│   │   │       ├── subscription.repository.interface.ts
│   │   │       ├── reading-material.repository.interface.ts
│   │   │       ├── module-video.repository.interface.ts
│   │   │       ├── quiz.repository.interface.ts
│   │   │       ├── question.repository.interface.ts
│   │   │       ├── course-progress.repository.interface.ts
│   │   │       ├── sub-course-progress.repository.interface.ts
│   │   │       ├── module-progress.repository.interface.ts
│   │   │       ├── reading-progress.repository.interface.ts
│   │   │       ├── video-progress.repository.interface.ts
│   │   │       ├── quiz-progress.repository.interface.ts
│   │   │       ├── question-progress.repository.interface.ts
│   │   │       └── index.ts
│   │   │
│   │   ├── application/                         # Application Layer - Use Cases
│   │   │   ├── ports/                           # Ports (Interfaces for external services)
│   │   │   │   ├── input/                       # Input ports (use case interfaces)
│   │   │   │   │   ├── auth/
│   │   │   │   │   │   ├── login.use-case.interface.ts
│   │   │   │   │   │   ├── register.use-case.interface.ts
│   │   │   │   │   │   ├── refresh-token.use-case.interface.ts
│   │   │   │   │   │   ├── logout.use-case.interface.ts
│   │   │   │   │   │   ├── revoke-all-tokens.use-case.interface.ts
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── users/
│   │   │   │   │   │   ├── create-user.use-case.interface.ts
│   │   │   │   │   │   ├── get-user.use-case.interface.ts
│   │   │   │   │   │   ├── update-user.use-case.interface.ts
│   │   │   │   │   │   ├── delete-user.use-case.interface.ts
│   │   │   │   │   │   ├── list-users.use-case.interface.ts
│   │   │   │   │   │   ├── assign-role.use-case.interface.ts
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── courses/
│   │   │   │   │   │   ├── create-course.use-case.interface.ts
│   │   │   │   │   │   ├── get-course.use-case.interface.ts
│   │   │   │   │   │   ├── update-course.use-case.interface.ts
│   │   │   │   │   │   ├── delete-course.use-case.interface.ts
│   │   │   │   │   │   ├── list-courses.use-case.interface.ts
│   │   │   │   │   │   ├── get-course-by-instructor.use-case.interface.ts
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── sub-courses/
│   │   │   │   │   │   ├── create-sub-course.use-case.interface.ts
│   │   │   │   │   │   ├── get-sub-course.use-case.interface.ts
│   │   │   │   │   │   ├── update-sub-course.use-case.interface.ts
│   │   │   │   │   │   ├── delete-sub-course.use-case.interface.ts
│   │   │   │   │   │   ├── list-sub-courses.use-case.interface.ts
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── modules/
│   │   │   │   │   │   ├── create-module.use-case.interface.ts
│   │   │   │   │   │   ├── get-module.use-case.interface.ts
│   │   │   │   │   │   ├── update-module.use-case.interface.ts
│   │   │   │   │   │   ├── delete-module.use-case.interface.ts
│   │   │   │   │   │   ├── list-modules.use-case.interface.ts
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── content/
│   │   │   │   │   │   ├── reading-materials/
│   │   │   │   │   │   │   ├── create-reading-material.use-case.interface.ts
│   │   │   │   │   │   │   ├── get-reading-material.use-case.interface.ts
│   │   │   │   │   │   │   ├── update-reading-material.use-case.interface.ts
│   │   │   │   │   │   │   ├── delete-reading-material.use-case.interface.ts
│   │   │   │   │   │   │   └── index.ts
│   │   │   │   │   │   ├── videos/
│   │   │   │   │   │   │   ├── create-video.use-case.interface.ts
│   │   │   │   │   │   │   ├── get-video.use-case.interface.ts
│   │   │   │   │   │   │   ├── update-video.use-case.interface.ts
│   │   │   │   │   │   │   ├── delete-video.use-case.interface.ts
│   │   │   │   │   │   │   └── index.ts
│   │   │   │   │   │   ├── quizzes/
│   │   │   │   │   │   │   ├── create-quiz.use-case.interface.ts
│   │   │   │   │   │   │   ├── get-quiz.use-case.interface.ts
│   │   │   │   │   │   │   ├── update-quiz.use-case.interface.ts
│   │   │   │   │   │   │   ├── delete-quiz.use-case.interface.ts
│   │   │   │   │   │   │   ├── submit-quiz.use-case.interface.ts
│   │   │   │   │   │   │   └── index.ts
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── subscriptions/
│   │   │   │   │   │   ├── enroll-student.use-case.interface.ts
│   │   │   │   │   │   ├── unenroll-student.use-case.interface.ts
│   │   │   │   │   │   ├── check-enrollment.use-case.interface.ts
│   │   │   │   │   │   ├── get-student-courses.use-case.interface.ts
│   │   │   │   │   │   ├── get-course-students.use-case.interface.ts
│   │   │   │   │   │   ├── mark-as-paid.use-case.interface.ts
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── progress/
│   │   │   │   │   │   ├── track-course-progress.use-case.interface.ts
│   │   │   │   │   │   ├── track-sub-course-progress.use-case.interface.ts
│   │   │   │   │   │   ├── track-module-progress.use-case.interface.ts
│   │   │   │   │   │   ├── mark-reading-complete.use-case.interface.ts
│   │   │   │   │   │   ├── mark-video-complete.use-case.interface.ts
│   │   │   │   │   │   ├── mark-quiz-complete.use-case.interface.ts
│   │   │   │   │   │   ├── save-question-answer.use-case.interface.ts
│   │   │   │   │   │   ├── get-student-progress.use-case.interface.ts
│   │   │   │   │   │   ├── get-course-progress.use-case.interface.ts
│   │   │   │   │   │   ├── calculate-progress.use-case.interface.ts
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   └── output/                      # Output ports (external service interfaces)
│   │   │   │       ├── hash.service.interface.ts           # Password hashing
│   │   │   │       ├── token.service.interface.ts          # JWT service
│   │   │   │       ├── storage.service.interface.ts        # File storage
│   │   │   │       ├── notification.service.interface.ts   # Notifications
│   │   │   │       ├── email.service.interface.ts          # Email service
│   │   │   │       ├── firebase.service.interface.ts       # Firebase push
│   │   │   │       └── index.ts
│   │   │   │
│   │   │   ├── use-cases/                       # Use Case Implementations
│   │   │   │   ├── auth/
│   │   │   │   │   ├── login.use-case.ts
│   │   │   │   │   ├── register.use-case.ts
│   │   │   │   │   ├── refresh-token.use-case.ts
│   │   │   │   │   ├── logout.use-case.ts
│   │   │   │   │   ├── revoke-all-tokens.use-case.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── users/
│   │   │   │   │   ├── create-user.use-case.ts
│   │   │   │   │   ├── get-user.use-case.ts
│   │   │   │   │   ├── update-user.use-case.ts
│   │   │   │   │   ├── delete-user.use-case.ts
│   │   │   │   │   ├── list-users.use-case.ts
│   │   │   │   │   ├── assign-role.use-case.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── courses/
│   │   │   │   │   ├── create-course.use-case.ts
│   │   │   │   │   ├── get-course.use-case.ts
│   │   │   │   │   ├── update-course.use-case.ts
│   │   │   │   │   ├── delete-course.use-case.ts
│   │   │   │   │   ├── list-courses.use-case.ts
│   │   │   │   │   ├── get-course-by-instructor.use-case.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── sub-courses/
│   │   │   │   │   ├── create-sub-course.use-case.ts
│   │   │   │   │   ├── get-sub-course.use-case.ts
│   │   │   │   │   ├── update-sub-course.use-case.ts
│   │   │   │   │   ├── delete-sub-course.use-case.ts
│   │   │   │   │   ├── list-sub-courses.use-case.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── modules/
│   │   │   │   │   ├── create-module.use-case.ts
│   │   │   │   │   ├── get-module.use-case.ts
│   │   │   │   │   ├── update-module.use-case.ts
│   │   │   │   │   ├── delete-module.use-case.ts
│   │   │   │   │   ├── list-modules.use-case.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── content/
│   │   │   │   │   ├── reading-materials/
│   │   │   │   │   │   ├── create-reading-material.use-case.ts
│   │   │   │   │   │   ├── get-reading-material.use-case.ts
│   │   │   │   │   │   ├── update-reading-material.use-case.ts
│   │   │   │   │   │   ├── delete-reading-material.use-case.ts
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── videos/
│   │   │   │   │   │   ├── create-video.use-case.ts
│   │   │   │   │   │   ├── get-video.use-case.ts
│   │   │   │   │   │   ├── update-video.use-case.ts
│   │   │   │   │   │   ├── delete-video.use-case.ts
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── quizzes/
│   │   │   │   │   │   ├── create-quiz.use-case.ts
│   │   │   │   │   │   ├── get-quiz.use-case.ts
│   │   │   │   │   │   ├── update-quiz.use-case.ts
│   │   │   │   │   │   ├── delete-quiz.use-case.ts
│   │   │   │   │   │   ├── submit-quiz.use-case.ts
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── subscriptions/
│   │   │   │   │   ├── enroll-student.use-case.ts
│   │   │   │   │   ├── unenroll-student.use-case.ts
│   │   │   │   │   ├── check-enrollment.use-case.ts
│   │   │   │   │   ├── get-student-courses.use-case.ts
│   │   │   │   │   ├── get-course-students.use-case.ts
│   │   │   │   │   ├── mark-as-paid.use-case.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── progress/
│   │   │   │   │   ├── track-course-progress.use-case.ts
│   │   │   │   │   ├── track-sub-course-progress.use-case.ts
│   │   │   │   │   ├── track-module-progress.use-case.ts
│   │   │   │   │   ├── mark-reading-complete.use-case.ts
│   │   │   │   │   ├── mark-video-complete.use-case.ts
│   │   │   │   │   ├── mark-quiz-complete.use-case.ts
│   │   │   │   │   ├── save-question-answer.use-case.ts
│   │   │   │   │   ├── get-student-progress.use-case.ts
│   │   │   │   │   ├── get-course-progress.use-case.ts
│   │   │   │   │   ├── calculate-progress.use-case.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── dto/                             # Data Transfer Objects (for use cases)
│   │   │   │   ├── auth/
│   │   │   │   │   ├── login-request.dto.ts
│   │   │   │   │   ├── login-response.dto.ts
│   │   │   │   │   ├── register-request.dto.ts
│   │   │   │   │   ├── register-response.dto.ts
│   │   │   │   │   ├── refresh-token-request.dto.ts
│   │   │   │   │   ├── refresh-token-response.dto.ts
│   │   │   │   │   ├── logout-request.dto.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── users/
│   │   │   │   │   ├── create-user.dto.ts
│   │   │   │   │   ├── update-user.dto.ts
│   │   │   │   │   ├── user-response.dto.ts
│   │   │   │   │   ├── list-users-request.dto.ts
│   │   │   │   │   ├── list-users-response.dto.ts
│   │   │   │   │   ├── assign-role.dto.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── courses/
│   │   │   │   │   ├── create-course.dto.ts
│   │   │   │   │   ├── update-course.dto.ts
│   │   │   │   │   ├── course-response.dto.ts
│   │   │   │   │   ├── list-courses-request.dto.ts
│   │   │   │   │   ├── list-courses-response.dto.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── sub-courses/
│   │   │   │   │   ├── create-sub-course.dto.ts
│   │   │   │   │   ├── update-sub-course.dto.ts
│   │   │   │   │   ├── sub-course-response.dto.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── modules/
│   │   │   │   │   ├── create-module.dto.ts
│   │   │   │   │   ├── update-module.dto.ts
│   │   │   │   │   ├── module-response.dto.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── content/
│   │   │   │   │   ├── reading-material.dto.ts
│   │   │   │   │   ├── video.dto.ts
│   │   │   │   │   ├── quiz.dto.ts
│   │   │   │   │   ├── question.dto.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── subscriptions/
│   │   │   │   │   ├── enroll-student.dto.ts
│   │   │   │   │   ├── subscription-response.dto.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── progress/
│   │   │   │   │   ├── progress-response.dto.ts
│   │   │   │   │   ├── course-progress.dto.ts
│   │   │   │   │   ├── module-progress.dto.ts
│   │   │   │   │   ├── content-progress.dto.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── services/                        # Application Services (Domain Services)
│   │   │       ├── progress-calculator.service.ts
│   │   │       ├── enrollment-validator.service.ts
│   │   │       ├── course-hierarchy.service.ts
│   │   │       └── index.ts
│   │   │
│   │   └── shared/                              # Shared Core utilities
│   │       ├── types/
│   │       │   ├── uuid.type.ts
│   │       │   ├── pagination.type.ts
│   │       │   ├── filter.type.ts
│   │       │   └── index.ts
│   │       ├── constants/
│   │       │   ├── error-messages.constant.ts
│   │       │   ├── validation.constant.ts
│   │       │   └── index.ts
│   │       └── utils/
│   │           ├── date.util.ts
│   │           ├── string.util.ts
│   │           └── index.ts
│   │
│   ├── infrastructure/                          # Infrastructure Layer (Framework Dependent)
│   │   ├── database/                            # Database Implementation
│   │   │   ├── prisma/                          # Prisma ORM
│   │   │   │   ├── schema.prisma               # Prisma schema
│   │   │   │   ├── migrations/                  # Database migrations
│   │   │   │   │   └── .gitkeep
│   │   │   │   └── seed.ts                      # Database seeding
│   │   │   │
│   │   │   ├── entities/                        # Database Entities (ORM Models)
│   │   │   │   ├── user/
│   │   │   │   │   ├── user.entity.ts
│   │   │   │   │   ├── admin.entity.ts
│   │   │   │   │   ├── instructor.entity.ts
│   │   │   │   │   ├── super-admin.entity.ts
│   │   │   │   │   ├── student.entity.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── auth/
│   │   │   │   │   ├── device-token.entity.ts
│   │   │   │   │   ├── refresh-token.entity.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── course/
│   │   │   │   │   ├── course.entity.ts
│   │   │   │   │   ├── sub-course.entity.ts
│   │   │   │   │   ├── module.entity.ts
│   │   │   │   │   ├── subscription.entity.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── content/
│   │   │   │   │   ├── reading-material.entity.ts
│   │   │   │   │   ├── module-video.entity.ts
│   │   │   │   │   ├── quiz.entity.ts
│   │   │   │   │   ├── question.entity.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── progress/
│   │   │   │   │   ├── course-progress.entity.ts
│   │   │   │   │   ├── sub-course-progress.entity.ts
│   │   │   │   │   ├── module-progress.entity.ts
│   │   │   │   │   ├── reading-progress.entity.ts
│   │   │   │   │   ├── video-progress.entity.ts
│   │   │   │   │   ├── quiz-progress.entity.ts
│   │   │   │   │   ├── question-progress.entity.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── repositories/                    # Repository Implementations
│   │   │   │   ├── base/
│   │   │   │   │   ├── base.repository.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── user/
│   │   │   │   │   ├── user.repository.ts
│   │   │   │   │   ├── admin.repository.ts
│   │   │   │   │   ├── instructor.repository.ts
│   │   │   │   │   ├── super-admin.repository.ts
│   │   │   │   │   ├── student.repository.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── auth/
│   │   │   │   │   ├── device-token.repository.ts
│   │   │   │   │   ├── refresh-token.repository.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── course/
│   │   │   │   │   ├── course.repository.ts
│   │   │   │   │   ├── sub-course.repository.ts
│   │   │   │   │   ├── module.repository.ts
│   │   │   │   │   ├── subscription.repository.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── content/
│   │   │   │   │   ├── reading-material.repository.ts
│   │   │   │   │   ├── module-video.repository.ts
│   │   │   │   │   ├── quiz.repository.ts
│   │   │   │   │   ├── question.repository.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── progress/
│   │   │   │   │   ├── course-progress.repository.ts
│   │   │   │   │   ├── sub-course-progress.repository.ts
│   │   │   │   │   ├── module-progress.repository.ts
│   │   │   │   │   ├── reading-progress.repository.ts
│   │   │   │   │   ├── video-progress.repository.ts
│   │   │   │   │   ├── quiz-progress.repository.ts
│   │   │   │   │   ├── question-progress.repository.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── mappers/                         # Entity ↔ Domain Model Mappers
│   │   │   │   ├── user.mapper.ts
│   │   │   │   ├── admin.mapper.ts
│   │   │   │   ├── instructor.mapper.ts
│   │   │   │   ├── super-admin.mapper.ts
│   │   │   │   ├── student.mapper.ts
│   │   │   │   ├── device-token.mapper.ts
│   │   │   │   ├── refresh-token.mapper.ts
│   │   │   │   ├── course.mapper.ts
│   │   │   │   ├── sub-course.mapper.ts
│   │   │   │   ├── module.mapper.ts
│   │   │   │   ├── subscription.mapper.ts
│   │   │   │   ├── reading-material.mapper.ts
│   │   │   │   ├── module-video.mapper.ts
│   │   │   │   ├── quiz.mapper.ts
│   │   │   │   ├── question.mapper.ts
│   │   │   │   ├── course-progress.mapper.ts
│   │   │   │   ├── sub-course-progress.mapper.ts
│   │   │   │   ├── module-progress.mapper.ts
│   │   │   │   ├── reading-progress.mapper.ts
│   │   │   │   ├── video-progress.mapper.ts
│   │   │   │   ├── quiz-progress.mapper.ts
│   │   │   │   ├── question-progress.mapper.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── database.module.ts               # Database module
│   │   │   └── prisma.service.ts                # Prisma service
│   │   │
│   │   ├── config/                              # Configuration
│   │   │   ├── env/
│   │   │   │   ├── env.config.ts               # Environment config
│   │   │   │   ├── env.validation.ts           # Env validation schema
│   │   │   │   └── index.ts
│   │   │   ├── database.config.ts              # Database config
│   │   │   ├── jwt.config.ts                   # JWT config
│   │   │   ├── firebase.config.ts              # Firebase config
│   │   │   ├── storage.config.ts               # Storage config
│   │   │   ├── app.config.ts                   # App config
│   │   │   └── index.ts
│   │   │
│   │   ├── security/                            # Security Infrastructure
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts           # JWT authentication guard
│   │   │   │   ├── roles.guard.ts              # Role-based guard
│   │   │   │   ├── subscription.guard.ts       # Check course enrollment
│   │   │   │   └── index.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts             # JWT strategy
│   │   │   │   ├── refresh-token.strategy.ts   # Refresh token strategy
│   │   │   │   └── index.ts
│   │   │   ├── decorators/
│   │   │   │   ├── roles.decorator.ts          # Roles decorator
│   │   │   │   ├── current-user.decorator.ts   # Current user decorator
│   │   │   │   ├── public.decorator.ts         # Public route decorator
│   │   │   │   └── index.ts
│   │   │   ├── services/
│   │   │   │   ├── hash.service.ts             # Password hashing (bcrypt)
│   │   │   │   ├── token.service.ts            # JWT token service
│   │   │   │   └── index.ts
│   │   │   └── security.module.ts
│   │   │
│   │   ├── external-services/                   # External Service Integrations
│   │   │   ├── firebase/
│   │   │   │   ├── firebase.service.ts         # Firebase admin service
│   │   │   │   ├── firebase-messaging.service.ts # Push notifications
│   │   │   │   ├── firebase.module.ts
│   │   │   │   └── index.ts
│   │   │   ├── storage/
│   │   │   │   ├── storage.service.ts          # File storage service
│   │   │   │   ├── supabase-storage.service.ts # Supabase storage impl
│   │   │   │   ├── storage.module.ts
│   │   │   │   └── index.ts
│   │   │   ├── email/
│   │   │   │   ├── email.service.ts            # Email service
│   │   │   │   ├── email.module.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   └── persistence/                         # Persistence utilities
│   │       ├── transaction.decorator.ts         # Transaction decorator
│   │       ├── unit-of-work.service.ts         # Unit of work pattern
│   │       └── index.ts
│   │
│   ├── presentation/                            # Presentation Layer (API/HTTP)
│   │   ├── http/                                # REST API
│   │   │   ├── controllers/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.controller.spec.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── users/
│   │   │   │   │   ├── users.controller.ts
│   │   │   │   │   ├── users.controller.spec.ts
│   │   │   │   │   ├── students.controller.ts
│   │   │   │   │   ├── instructors.controller.ts
│   │   │   │   │   ├── admins.controller.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── courses/
│   │   │   │   │   ├── courses.controller.ts
│   │   │   │   │   ├── courses.controller.spec.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── sub-courses/
│   │   │   │   │   ├── sub-courses.controller.ts
│   │   │   │   │   ├── sub-courses.controller.spec.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── modules/
│   │   │   │   │   ├── modules.controller.ts
│   │   │   │   │   ├── modules.controller.spec.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── content/
│   │   │   │   │   ├── reading-materials.controller.ts
│   │   │   │   │   ├── videos.controller.ts
│   │   │   │   │   ├── quizzes.controller.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── subscriptions/
│   │   │   │   │   ├── subscriptions.controller.ts
│   │   │   │   │   ├── subscriptions.controller.spec.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── progress/
│   │   │   │   │   ├── progress.controller.ts
│   │   │   │   │   ├── progress.controller.spec.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── dto/                             # HTTP DTOs (Request/Response)
│   │   │   │   ├── auth/
│   │   │   │   │   ├── login-request.dto.ts
│   │   │   │   │   ├── login-response.dto.ts
│   │   │   │   │   ├── register-request.dto.ts
│   │   │   │   │   ├── register-response.dto.ts
│   │   │   │   │   ├── refresh-token-request.dto.ts
│   │   │   │   │   ├── refresh-token-response.dto.ts
│   │   │   │   │   ├── logout-request.dto.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── users/
│   │   │   │   │   ├── create-user-request.dto.ts
│   │   │   │   │   ├── update-user-request.dto.ts
│   │   │   │   │   ├── user-response.dto.ts
│   │   │   │   │   ├── list-users-query.dto.ts
│   │   │   │   │   ├── assign-role-request.dto.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── courses/
│   │   │   │   │   ├── create-course-request.dto.ts
│   │   │   │   │   ├── update-course-request.dto.ts
│   │   │   │   │   ├── course-response.dto.ts
│   │   │   │   │   ├── list-courses-query.dto.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── sub-courses/
│   │   │   │   │   ├── create-sub-course-request.dto.ts
│   │   │   │   │   ├── update-sub-course-request.dto.ts
│   │   │   │   │   ├── sub-course-response.dto.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── modules/
│   │   │   │   │   ├── create-module-request.dto.ts
│   │   │   │   │   ├── update-module-request.dto.ts
│   │   │   │   │   ├── module-response.dto.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── content/
│   │   │   │   │   ├── reading-material-request.dto.ts
│   │   │   │   │   ├── reading-material-response.dto.ts
│   │   │   │   │   ├── video-request.dto.ts
│   │   │   │   │   ├── video-response.dto.ts
│   │   │   │   │   ├── quiz-request.dto.ts
│   │   │   │   │   ├── quiz-response.dto.ts
│   │   │   │   │   ├── submit-quiz-request.dto.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── subscriptions/
│   │   │   │   │   ├── enroll-request.dto.ts
│   │   │   │   │   ├── subscription-response.dto.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── progress/
│   │   │   │   │   ├── progress-response.dto.ts
│   │   │   │   │   ├── course-progress-response.dto.ts
│   │   │   │   │   ├── mark-complete-request.dto.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── validators/                      # Custom validators
│   │   │   │   ├── is-uuid.validator.ts
│   │   │   │   ├── is-strong-password.validator.ts
│   │   │   │   ├── is-valid-phone.validator.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── interceptors/
│   │   │   │   ├── transform.interceptor.ts     # Response transformation
│   │   │   │   ├── logging.interceptor.ts       # Request logging
│   │   │   │   ├── timeout.interceptor.ts       # Request timeout
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── filters/                         # Exception filters
│   │   │   │   ├── http-exception.filter.ts     # HTTP exception filter
│   │   │   │   ├── domain-exception.filter.ts   # Domain exception filter
│   │   │   │   ├── all-exceptions.filter.ts     # Global exception filter
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── pipes/                           # Validation pipes
│   │   │   │   ├── validation.pipe.ts           # Global validation pipe
│   │   │   │   ├── parse-uuid.pipe.ts           # UUID parsing pipe
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── middleware/
│   │   │   │   ├── logger.middleware.ts         # Request logger
│   │   │   │   ├── cors.middleware.ts           # CORS middleware
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── swagger/                         # API Documentation
│   │   │       ├── swagger.config.ts
│   │   │       ├── decorators/
│   │   │       │   ├── api-auth.decorator.ts
│   │   │       │   ├── api-paginated.decorator.ts
│   │   │       │   └── index.ts
│   │   │       └── index.ts
│   │   │
│   │   ├── graphql/                             # GraphQL API (Optional)
│   │   │   ├── resolvers/
│   │   │   │   ├── auth.resolver.ts
│   │   │   │   ├── users.resolver.ts
│   │   │   │   ├── courses.resolver.ts
│   │   │   │   ├── progress.resolver.ts
│   │   │   │   └── index.ts
│   │   │   ├── types/
│   │   │   │   ├── user.type.ts
│   │   │   │   ├── course.type.ts
│   │   │   │   ├── progress.type.ts
│   │   │   │   └── index.ts
│   │   │   ├── inputs/
│   │   │   │   ├── create-user.input.ts
│   │   │   │   ├── create-course.input.ts
│   │   │   │   └── index.ts
│   │   │   ├── schema.gql
│   │   │   └── graphql.module.ts
│   │   │
│   │   └── websockets/                          # WebSocket (Real-time)
│   │       ├── gateways/
│   │       │   ├── notifications.gateway.ts     # Notifications gateway
│   │       │   ├── progress.gateway.ts          # Real-time progress
│   │       │   └── index.ts
│   │       ├── dto/
│   │       │   ├── notification.dto.ts
│   │       │   └── index.ts
│   │       └── websockets.module.ts
│   │
│   ├── modules/                                 # NestJS Modules (Wiring)
│   │   ├── auth/
│   │   │   ├── auth.module.ts                  # Auth module wiring
│   │   │   └── index.ts
│   │   ├── users/
│   │   │   ├── users.module.ts                 # Users module wiring
│   │   │   └── index.ts
│   │   ├── courses/
│   │   │   ├── courses.module.ts               # Courses module wiring
│   │   │   └── index.ts
│   │   ├── sub-courses/
│   │   │   ├── sub-courses.module.ts
│   │   │   └── index.ts
│   │   ├── modules/
│   │   │   ├── modules.module.ts
│   │   │   └── index.ts
│   │   ├── content/
│   │   │   ├── content.module.ts               # Content module wiring
│   │   │   └── index.ts
│   │   ├── subscriptions/
│   │   │   ├── subscriptions.module.ts
│   │   │   └── index.ts
│   │   ├── progress/
│   │   │   ├── progress.module.ts              # Progress module wiring
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── shared/                                  # Shared Infrastructure utilities
│   │   ├── constants/
│   │   │   ├── api-routes.constant.ts          # API route constants
│   │   │   ├── error-codes.constant.ts         # Error codes
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   ├── express.d.ts                    # Express type extensions
│   │   │   ├── request-user.type.ts            # Request user type
│   │   │   └── index.ts
│   │   ├── decorators/
│   │   │   ├── api-response.decorator.ts       # API response decorator
│   │   │   └── index.ts
│   │   └── utils/
│   │       ├── pagination.util.ts              # Pagination helper
│   │       ├── response.util.ts                # Response wrapper
│   │       └── index.ts
│   │
│   ├── app.module.ts                           # Root application module
│   ├── main.ts                                 # Application entry point
│   └── main.hmr.ts                             # Hot module replacement (optional)
│
├── test/                                        # E2E and Integration Tests
│   ├── e2e/
│   │   ├── auth/
│   │   │   ├── login.e2e-spec.ts
│   │   │   ├── register.e2e-spec.ts
│   │   │   └── refresh-token.e2e-spec.ts
│   │   ├── users/
│   │   │   ├── create-user.e2e-spec.ts
│   │   │   ├── update-user.e2e-spec.ts
│   │   │   └── delete-user.e2e-spec.ts
│   │   ├── courses/
│   │   │   ├── create-course.e2e-spec.ts
│   │   │   ├── list-courses.e2e-spec.ts
│   │   │   └── enroll-course.e2e-spec.ts
│   │   ├── progress/
│   │   │   ├── track-progress.e2e-spec.ts
│   │   │   └── get-progress.e2e-spec.ts
│   │   └── jest-e2e.json
│   │
│   ├── integration/
│   │   ├── repositories/
│   │   │   ├── user.repository.spec.ts
│   │   │   ├── course.repository.spec.ts
│   │   │   └── progress.repository.spec.ts
│   │   ├── services/
│   │   │   ├── hash.service.spec.ts
│   │   │   ├── token.service.spec.ts
│   │   │   └── progress-calculator.service.spec.ts
│   │   └── jest-integration.json
│   │
│   ├── fixtures/                               # Test fixtures
│   │   ├── users.fixture.ts
│   │   ├── courses.fixture.ts
│   │   ├── subscriptions.fixture.ts
│   │   └── index.ts
│   │
│   └── helpers/                                # Test helpers
│       ├── database.helper.ts                  # Database test utilities
│       ├── auth.helper.ts                      # Auth test utilities
│       └── index.ts
│
├── docs/                                        # Documentation
│   ├── architecture/
│   │   ├── clean-architecture.md
│   │   ├── dependency-flow.md
│   │   └── layer-responsibilities.md
│   ├── api/
│   │   ├── auth-endpoints.md
│   │   ├── course-endpoints.md
│   │   └── progress-endpoints.md
│   ├── database/
│   │   ├── schema-design.md
│   │   ├── migrations.md
│   │   └── seeding.md
│   └── deployment/
│       ├── environment-variables.md
│       └── deployment-guide.md
│
├── scripts/                                     # Utility scripts
│   ├── generate-module.sh                      # Generate new module
│   ├── generate-use-case.sh                    # Generate use case
│   ├── seed-database.ts                        # Seed script
│   └── clear-database.ts                       # Clear DB script
│
├── .env.example                                # Environment variables example
├── .env.development                            # Development environment
├── .env.test                                   # Test environment
├── .env.production                             # Production environment
├── .eslintrc.js                                # ESLint configuration
├── .prettierrc                                 # Prettier configuration
├── .gitignore                                  # Git ignore
├── nest-cli.json                               # NestJS CLI config
├── tsconfig.json                               # TypeScript config
├── tsconfig.build.json                         # Build TypeScript config
├── package.json                                # Dependencies
├── package-lock.json                           # Lock file
├── README.md                                   # Project README
└── ARCHITECTURE_OPTIONS.md                     # Architecture documentation
```

---

## Layer Responsibilities

### 1. Core Layer (`src/core/`)

**Purpose**: Pure business logic, framework-independent

#### Domain (`core/domain/`)

- **Models**: Pure business entities with behavior
- **Value Objects**: Immutable objects representing domain concepts
- **Enums**: Domain-specific enumerations
- **Exceptions**: Domain-specific errors
- **Repository Interfaces**: Contracts for data access (no implementation)

#### Application (`core/application/`)

- **Ports/Input**: Use case interfaces (what the application can do)
- **Ports/Output**: External service interfaces (what the application needs)
- **Use Cases**: Application business logic (orchestration)
- **DTOs**: Data transfer objects for use cases
- **Services**: Domain services (complex business logic)

#### Shared (`core/shared/`)

- **Types**: Core type definitions
- **Constants**: Business constants
- **Utils**: Pure utility functions

---

### 2. Infrastructure Layer (`src/infrastructure/`)

**Purpose**: Framework and external dependencies

#### Database (`infrastructure/database/`)

- **Prisma Schema**: Database schema definition
- **Entities**: ORM entities (database representation)
- **Repositories**: Repository interface implementations
- **Mappers**: Convert between database entities and domain models

#### Config (`infrastructure/config/`)

- Environment configuration
- Database, JWT, Firebase configuration
- Validation schemas

#### Security (`infrastructure/security/`)

- **Guards**: Authentication/authorization guards
- **Strategies**: Passport strategies
- **Services**: Hash, JWT token services
- **Decorators**: Security decorators

#### External Services (`infrastructure/external-services/`)

- Firebase integration
- Storage service (Supabase/S3)
- Email service
- Push notification service

---

### 3. Presentation Layer (`src/presentation/`)

**Purpose**: API interfaces and HTTP handling

#### HTTP (`presentation/http/`)

- **Controllers**: REST API endpoints
- **DTOs**: HTTP request/response objects
- **Validators**: Custom validation rules
- **Interceptors**: Response transformation
- **Filters**: Exception handling
- **Pipes**: Input transformation
- **Middleware**: Request processing
- **Swagger**: API documentation

#### GraphQL (`presentation/graphql/`) - Optional

- Resolvers, types, inputs for GraphQL

#### WebSockets (`presentation/websockets/`) - Optional

- Real-time communication gateways

---

### 4. Modules (`src/modules/`)

**Purpose**: Wiring and dependency injection

Each module:

- Imports required dependencies
- Provides use cases, services, repositories
- Exports what other modules need
- Configures controllers

---

### 5. Shared (`src/shared/`)

**Purpose**: Cross-cutting concerns

- API constants
- Type definitions
- Utility functions
- Decorators

---

## File Naming Conventions

```
# Domain Models
user.model.ts
course.model.ts

# Repository Interfaces
user.repository.interface.ts
course.repository.interface.ts

# Repository Implementations
user.repository.ts
course.repository.ts

# Use Cases
login.use-case.ts
create-course.use-case.ts

# Use Case Interfaces
login.use-case.interface.ts
create-course.use-case.interface.ts

# DTOs
create-user-request.dto.ts
user-response.dto.ts

# Controllers
users.controller.ts
courses.controller.ts

# Services
progress-calculator.service.ts
hash.service.ts

# Entities (Database)
user.entity.ts
course.entity.ts

# Mappers
user.mapper.ts
course.mapper.ts

# Tests
user.repository.spec.ts
login.use-case.spec.ts
users.controller.spec.ts
create-user.e2e-spec.ts
```

---

## Dependency Flow (Critical!)

```
┌─────────────────────────────────────┐
│     Presentation Layer              │
│  (Controllers, DTOs, Validators)    │
└──────────────┬──────────────────────┘
               │ depends on
               ↓
┌─────────────────────────────────────┐
│     Application Layer               │
│  (Use Cases, Ports/Input)           │
└──────────────┬──────────────────────┘
               │ depends on
               ↓
┌─────────────────────────────────────┐
│     Domain Layer                    │
│  (Models, Repositories Interfaces)  │
└─────────────────────────────────────┘
               ↑
               │ implements
┌──────────────┴──────────────────────┐
│     Infrastructure Layer            │
│  (DB, Repositories, External APIs)  │
└─────────────────────────────────────┘
```

**Rules**:

- Domain Layer has NO dependencies
- Application Layer depends ONLY on Domain
- Infrastructure implements Domain interfaces
- Presentation depends on Application
- Infrastructure is injected via dependency injection

---

## Example: Complete Feature Flow

### Example: Login Use Case

```
1. HTTP Request arrives at:
   presentation/http/controllers/auth/auth.controller.ts

2. Controller calls Use Case:
   core/application/use-cases/auth/login.use-case.ts

3. Use Case uses Domain Repository Interface:
   core/domain/repositories/user.repository.interface.ts

4. Repository Implementation (injected):
   infrastructure/database/repositories/user/user.repository.ts

5. Mapper converts Entity → Domain Model:
   infrastructure/database/mappers/user.mapper.ts

6. Use Case returns DTO:
   core/application/dto/auth/login-response.dto.ts

7. Controller sends HTTP Response
```

---

## Key Design Patterns

### 1. Repository Pattern

- Interfaces in domain layer
- Implementations in infrastructure
- Mappers convert between layers

### 2. Use Case Pattern

- Each business operation = 1 use case
- Orchestrates domain logic
- Uses repository interfaces

### 3. Dependency Inversion

- High-level modules don't depend on low-level
- Both depend on abstractions (interfaces)

### 4. Mapper Pattern

- Separate database entities from domain models
- Mappers handle conversion

### 5. DTO Pattern

- Separate use case DTOs from HTTP DTOs
- Validation at presentation layer

---

## Module Organization Example

### Auth Module Structure

```
core/
├── domain/
│   ├── models/
│   │   └── user/user.model.ts
│   └── repositories/
│       └── user.repository.interface.ts
├── application/
│   ├── ports/input/auth/
│   │   ├── login.use-case.interface.ts
│   │   └── register.use-case.interface.ts
│   ├── use-cases/auth/
│   │   ├── login.use-case.ts
│   │   └── register.use-case.ts
│   └── dto/auth/
│       ├── login-request.dto.ts
│       └── login-response.dto.ts

infrastructure/
├── database/
│   ├── entities/user/user.entity.ts
│   ├── repositories/user/user.repository.ts
│   └── mappers/user.mapper.ts
└── security/
    ├── services/
    │   ├── hash.service.ts
    │   └── token.service.ts
    └── guards/jwt-auth.guard.ts

presentation/
└── http/
    ├── controllers/auth/auth.controller.ts
    └── dto/auth/
        ├── login-request.dto.ts
        └── login-response.dto.ts

modules/
└── auth/auth.module.ts
```

---

## Testing Strategy

### Unit Tests

- Test use cases in isolation
- Mock repository interfaces
- Test domain model behavior

### Integration Tests

- Test repository implementations
- Test with real database (test DB)
- Test mappers

### E2E Tests

- Test complete API flows
- Test authentication
- Test authorization

---

## Next Steps

1. **Initialize NestJS Project**

   ```bash
   nest new backend
   ```

2. **Install Dependencies**

   ```bash
   npm install @prisma/client
   npm install -D prisma
   npm install passport passport-jwt @nestjs/passport @nestjs/jwt
   npm install bcrypt
   npm install class-validator class-transformer
   npm install @nestjs/swagger
   ```

3. **Create Folder Structure**

   - Create all folders as per structure
   - Add index.ts barrel exports

4. **Setup Prisma**

   - Initialize Prisma
   - Create schema based on UML

5. **Start with Core Layer**

   - Define domain models
   - Create repository interfaces
   - No framework dependencies!

6. **Build Infrastructure**

   - Implement repositories
   - Create database entities
   - Build mappers

7. **Create Use Cases**

   - Start with auth use cases
   - Then user management
   - Then course features

8. **Wire Presentation**
   - Create controllers
   - Add DTOs and validation
   - Setup Swagger

---

## Important Principles

### ✅ DO

- Keep domain logic in domain layer
- Use interfaces for dependencies
- Use dependency injection
- Write tests for use cases
- Use DTOs for data transfer
- Map between layers

### ❌ DON'T

- Import framework in domain layer
- Import infrastructure in domain/application
- Put business logic in controllers
- Use database entities in use cases
- Skip mappers
- Tightly couple layers

---

This structure ensures:

- **Testability**: Core logic is framework-independent
- **Maintainability**: Clear separation of concerns
- **Scalability**: Easy to add features
- **Flexibility**: Easy to swap infrastructure
- **Team Collaboration**: Clear boundaries for parallel work
