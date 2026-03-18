'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const passwordHash = await bcrypt.hash('Admin@123', 10);

    await queryInterface.bulkInsert('users', [
      {
        id: '11111111-1111-4111-8111-111111111111',
        email: 'student@esss.local',
        password: passwordHash,
        firstName: 'Student',
        lastName: 'Demo',
        phoneNumber: '251900000001',
        role: 'STUDENT',
        isActive: true,
        level: 'BEGINNER',
        enrollmentDate: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: '22222222-2222-4222-8222-222222222222',
        email: 'instructor@esss.local',
        password: passwordHash,
        firstName: 'Instructor',
        lastName: 'Demo',
        phoneNumber: '251900000002',
        role: 'INSTRUCTOR',
        isActive: true,
        bio: 'Demo instructor account',
        expertise: ['typescript', 'nestjs'],
        hireDate: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: '33333333-3333-4333-8333-333333333333',
        email: 'admin@esss.local',
        password: passwordHash,
        firstName: 'Admin',
        lastName: 'Demo',
        phoneNumber: '251900000003',
        role: 'ADMIN',
        isActive: true,
        department: 'Operations',
        hireDate: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: '44444444-4444-4444-8444-444444444444',
        email: 'superadmin@esss.local',
        password: passwordHash,
        firstName: 'Super',
        lastName: 'Admin',
        phoneNumber: '251900000004',
        role: 'SUPER_ADMIN',
        isActive: true,
        permissions: ['*'],
        hireDate: now,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: {
        [Sequelize.Op.in]: [
          'student@esss.local',
          'instructor@esss.local',
          'admin@esss.local',
          'superadmin@esss.local',
        ],
      },
    });
  },
};
