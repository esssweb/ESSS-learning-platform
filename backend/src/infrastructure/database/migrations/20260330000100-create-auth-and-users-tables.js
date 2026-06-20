'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create auth table
    await queryInterface.createTable('auth', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      email_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      otp_code: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      otp_expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      otp_attempt_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      otp_request_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      last_otp_sent_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      verification_token: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Create users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      auth_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'auth',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      first_name: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      last_name: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      phone_number: {
        type: Sequelize.TEXT,
        allowNull: true,
        unique: true,
      },
      profile_picture: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      gender: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      role: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: 'STUDENT',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Create device_tokens table
    await queryInterface.createTable('device_tokens', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      firebase_token: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      device_name: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      device_type: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Create refresh_tokens table
    await queryInterface.createTable('refresh_tokens', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      token: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true,
      },
      device_token_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'device_tokens',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      is_revoked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('refresh_tokens');
    await queryInterface.dropTable('device_tokens');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('auth');
  },
};
