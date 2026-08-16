'use strict';

const bcrypt = require('bcrypt');

/**
 * Demo accounts, one per role.
 *
 * Credentials live in `auth`, profile data in `users`, linked by users.auth_id,
 * matching migration 20260330000100. Columns are snake_case because the
 * Sequelize entities are declared with `underscored: true`.
 *
 * All four accounts share the password: Admin@123
 */
const DEMO_ACCOUNTS = [
  {
    authId: 'a1111111-1111-4111-8111-111111111111',
    userId: '11111111-1111-4111-8111-111111111111',
    email: 'student@esss.local',
    firstName: 'Student',
    lastName: 'Demo',
    phoneNumber: '251900000001',
    role: 'STUDENT',
  },
  {
    authId: 'a2222222-2222-4222-8222-222222222222',
    userId: '22222222-2222-4222-8222-222222222222',
    email: 'instructor@esss.local',
    firstName: 'Instructor',
    lastName: 'Demo',
    phoneNumber: '251900000002',
    role: 'INSTRUCTOR',
  },
  {
    authId: 'a3333333-3333-4333-8333-333333333333',
    userId: '33333333-3333-4333-8333-333333333333',
    email: 'admin@esss.local',
    firstName: 'Admin',
    lastName: 'Demo',
    phoneNumber: '251900000003',
    role: 'ADMIN',
  },
  {
    authId: 'a4444444-4444-4444-8444-444444444444',
    userId: '44444444-4444-4444-8444-444444444444',
    email: 'superadmin@esss.local',
    firstName: 'Super',
    lastName: 'Admin',
    phoneNumber: '251900000004',
    role: 'SUPER_ADMIN',
  },
];

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const passwordHash = await bcrypt.hash('Admin@123', 10);

    // auth rows first — users.auth_id has a FK onto them.
    await queryInterface.bulkInsert(
      'auth',
      DEMO_ACCOUNTS.map((account) => ({
        id: account.authId,
        email: account.email,
        password: passwordHash,
        email_verified: true,
        otp_code: null,
        otp_expires_at: null,
        otp_attempt_count: 0,
        otp_request_count: 0,
        last_otp_sent_at: null,
        verification_token: null,
        is_active: true,
        created_at: now,
        updated_at: now,
      })),
    );

    await queryInterface.bulkInsert(
      'users',
      DEMO_ACCOUNTS.map((account) => ({
        id: account.userId,
        auth_id: account.authId,
        first_name: account.firstName,
        last_name: account.lastName,
        phone_number: account.phoneNumber,
        profile_picture: null,
        gender: null,
        role: account.role,
        created_at: now,
        updated_at: now,
      })),
    );
  },

  async down(queryInterface, Sequelize) {
    // users first — the FK points this way. (ON DELETE CASCADE would handle it,
    // but being explicit keeps the rollback readable.)
    await queryInterface.bulkDelete('users', {
      id: { [Sequelize.Op.in]: DEMO_ACCOUNTS.map((a) => a.userId) },
    });

    await queryInterface.bulkDelete('auth', {
      id: { [Sequelize.Op.in]: DEMO_ACCOUNTS.map((a) => a.authId) },
    });
  },
};
