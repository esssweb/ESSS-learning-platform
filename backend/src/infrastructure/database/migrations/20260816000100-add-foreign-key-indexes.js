'use strict';

/**
 * Adds indexes on the foreign keys and filter columns that are queried on every
 * login, logout, and user listing.
 *
 * The initial migration only created indexes implicitly, via UNIQUE constraints
 * (auth.email, users.auth_id, users.phone_number, refresh_tokens.token). The
 * plain foreign keys below had none, so every lookup by user_id was a
 * sequential scan.
 *
 * Covers:
 *   refresh_tokens.user_id          RefreshTokenRepository.findByUserId / revokeByUserId
 *   refresh_tokens.device_token_id  RefreshTokenRepository.revokeByDeviceTokenId
 *   device_tokens.user_id           DeviceTokenRepository.findByUserId / deactivateByUserId
 *   users.role                      UserRepository.findByRole / paginated role filter
 */
const INDEXES = [
  { table: 'refresh_tokens', fields: ['user_id'], name: 'idx_refresh_tokens_user_id' },
  {
    table: 'refresh_tokens',
    fields: ['device_token_id'],
    name: 'idx_refresh_tokens_device_token_id',
  },
  { table: 'device_tokens', fields: ['user_id'], name: 'idx_device_tokens_user_id' },
  { table: 'users', fields: ['role'], name: 'idx_users_role' },
];

module.exports = {
  async up(queryInterface) {
    for (const index of INDEXES) {
      await queryInterface.addIndex(index.table, index.fields, { name: index.name });
    }
  },

  async down(queryInterface) {
    for (const index of [...INDEXES].reverse()) {
      await queryInterface.removeIndex(index.table, index.name);
    }
  },
};
