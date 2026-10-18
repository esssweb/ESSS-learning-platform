'use strict';

/**
 * Two-factor state for admin login.
 *
 * The login_otp_* columns deliberately mirror the registration otp_* columns
 * rather than sharing them: send-verification-otp rejects fully-registered
 * accounts and markEmailVerified clears the registration fields, so one shared
 * slot would let the two flows clobber each other and share a rate limit.
 */
const COLUMNS = {
  totp_secret: { type: 'TEXT', allowNull: true },
  totp_enabled_at: { type: 'DATE', allowNull: true },
  totp_last_used_step: { type: 'BIGINT', allowNull: true },
  login_otp_code: { type: 'TEXT', allowNull: true },
  login_otp_expires_at: { type: 'DATE', allowNull: true },
  login_otp_attempt_count: { type: 'INTEGER', allowNull: false, defaultValue: 0 },
  login_otp_request_count: { type: 'INTEGER', allowNull: false, defaultValue: 0 },
  login_otp_last_sent_at: { type: 'DATE', allowNull: true },
};

module.exports = {
  // One transaction so a mid-way failure cannot leave the auth table half-migrated.
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      for (const [name, spec] of Object.entries(COLUMNS)) {
        await queryInterface.addColumn(
          'auth',
          name,
          { ...spec, type: Sequelize[spec.type] },
          { transaction },
        );
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      for (const name of Object.keys(COLUMNS).reverse()) {
        await queryInterface.removeColumn('auth', name, { transaction });
      }
    });
  },
};
