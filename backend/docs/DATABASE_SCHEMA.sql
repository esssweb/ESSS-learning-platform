-- PostgreSQL
-- Optional: for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================
-- AUTH / USER TABLES
-- =========================

CREATE TABLE auth (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT,
    role_id UUID NULL,              -- UML says Role(FK), but role table is not shown
    profile_picture TEXT,
    gender TEXT,                    -- enum in UML
    CONSTRAINT fk_users_auth
        FOREIGN KEY (auth_id) REFERENCES auth(id) ON DELETE CASCADE
);

CREATE TABLE admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    organizational_role TEXT,
    role TEXT,
    CONSTRAINT fk_admin_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE instructor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    CONSTRAINT fk_instructor_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE super_admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    CONSTRAINT fk_super_admin_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE student (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    level TEXT,                     -- enum in UML
    CONSTRAINT fk_student_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE device_token (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    firebase_token TEXT NOT NULL,
    CONSTRAINT fk_device_token_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE refresh_token (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    refresh_token TEXT NOT NULL,
    device_id UUID NOT NULL UNIQUE,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_refresh_token_device
        FOREIGN KEY (device_id) REFERENCES device_token(id) ON DELETE CASCADE
);

-- =========================
-- COURSE STRUCTURE
-- =========================

CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    thumbnail TEXT,
    description TEXT,
    level TEXT,                     -- enum in UML
    category TEXT,                  -- enum in UML
    instructor_id UUID,
    CONSTRAINT fk_courses_instructor
        FOREIGN KEY (instructor_id) REFERENCES instructor(id) ON DELETE SET NULL
);

CREATE TABLE sub_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail TEXT,
    CONSTRAINT fk_sub_courses_course
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE module (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subcourse_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    CONSTRAINT fk_module_subcourse
        FOREIGN KEY (subcourse_id) REFERENCES sub_courses(id) ON DELETE CASCADE
);

CREATE TABLE reading_material (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reading_content TEXT NOT NULL,
    module_id UUID NOT NULL,
    CONSTRAINT fk_reading_material_module
        FOREIGN KEY (module_id) REFERENCES module(id) ON DELETE CASCADE
);

CREATE TABLE module_video (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_url TEXT NOT NULL,
    module_id UUID NOT NULL,
    CONSTRAINT fk_module_video_module
        FOREIGN KEY (module_id) REFERENCES module(id) ON DELETE CASCADE
);

CREATE TABLE quiz (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    CONSTRAINT fk_quiz_module
        FOREIGN KEY (module_id) REFERENCES module(id) ON DELETE CASCADE
);

CREATE TABLE question (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL,
    question TEXT NOT NULL,
    question_type TEXT,             -- enum in UML
    correct_answer TEXT[],
    CONSTRAINT fk_question_quiz
        FOREIGN KEY (quiz_id) REFERENCES quiz(id) ON DELETE CASCADE
);

CREATE TABLE subscription (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL,
    student_id UUID NOT NULL,
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_subscription_course
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT fk_subscription_student
        FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
    CONSTRAINT uq_subscription_student_course
        UNIQUE (course_id, student_id)
);

-- =========================
-- STUDENT PROGRESS
-- =========================

CREATE TABLE student_course_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    course_id UUID NOT NULL,
    progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_student_course_progress_student
        FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_course_progress_course
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT uq_student_course_progress
        UNIQUE (student_id, course_id)
);

CREATE TABLE student_subcourse_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    subcourse_id UUID NOT NULL,
    progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_student_subcourse_progress_student
        FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_subcourse_progress_subcourse
        FOREIGN KEY (subcourse_id) REFERENCES sub_courses(id) ON DELETE CASCADE,
    CONSTRAINT uq_student_subcourse_progress
        UNIQUE (student_id, subcourse_id)
);

CREATE TABLE student_module_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    module_id UUID NOT NULL,
    progress_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_student_module_progress_student
        FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_module_progress_module
        FOREIGN KEY (module_id) REFERENCES module(id) ON DELETE CASCADE,
    CONSTRAINT uq_student_module_progress
        UNIQUE (student_id, module_id)
);

CREATE TABLE student_reading_material_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    reading_material_id UUID NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_student_reading_material_progress_student
        FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_reading_material_progress_reading_material
        FOREIGN KEY (reading_material_id) REFERENCES reading_material(id) ON DELETE CASCADE,
    CONSTRAINT uq_student_reading_material_progress
        UNIQUE (student_id, reading_material_id)
);

CREATE TABLE student_video_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    video_id UUID NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_student_video_progress_student
        FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_video_progress_video
        FOREIGN KEY (video_id) REFERENCES module_video(id) ON DELETE CASCADE,
    CONSTRAINT uq_student_video_progress
        UNIQUE (student_id, video_id)
);

CREATE TABLE student_quiz_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    quiz_id UUID NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_student_quiz_progress_student
        FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_quiz_progress_quiz
        FOREIGN KEY (quiz_id) REFERENCES quiz(id) ON DELETE CASCADE,
    CONSTRAINT uq_student_quiz_progress
        UNIQUE (student_id, quiz_id)
);

CREATE TABLE student_question_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    question_id UUID NOT NULL,
    answer TEXT,
    CONSTRAINT fk_student_question_progress_student
        FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_question_progress_question
        FOREIGN KEY (question_id) REFERENCES question(id) ON DELETE CASCADE,
    CONSTRAINT uq_student_question_progress
        UNIQUE (student_id, question_id)
);
