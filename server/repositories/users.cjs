function createUsersRepository(db) {
  const sessionUserFields = `
    id,
    email,
    full_name,
    role,
    accent_color,
    avatar_url,
    workspace_logo_url,
    created_at,
    suspended,
    last_sign_in_at,
    upload_quota_bytes
  `;

  return {
    count() {
      const row = db.prepare('SELECT COUNT(*) AS count FROM users').get();
      return Number(row?.count || 0);
    },

    createUser({ id, email, fullName, role, passwordHash, createdAt }) {
      db.prepare('INSERT INTO users (id, email, full_name, role, password_hash, created_at) VALUES (?,?,?,?,?,?)')
        .run(id, email, fullName, role, passwordHash, createdAt);
      return this.getById(id);
    },

    deleteById(userId) {
      db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    },

    getByEmail(email) {
      return db.prepare('SELECT * FROM users WHERE email = ?').get(email) || null;
    },

    getById(userId) {
      return db.prepare(`SELECT ${sessionUserFields} FROM users WHERE id = ?`).get(userId) || null;
    },

    getRawById(userId) {
      return db.prepare('SELECT * FROM users WHERE id = ?').get(userId) || null;
    },

    listWithUsage() {
      return db.prepare(`
        SELECT
          u.id,
          u.email,
          u.full_name,
          u.role,
          u.created_at,
          u.suspended,
          u.last_sign_in_at,
          u.upload_quota_bytes,
          COALESCE(SUM(d.file_size), 0) AS total_uploaded_size
        FROM users u
        LEFT JOIN documents d ON d.user_id = u.id
        GROUP BY u.id
        ORDER BY u.created_at ASC
      `).all();
    },

    updateById(userId, changes) {
      const sets = [];
      const values = [];

      if (Object.prototype.hasOwnProperty.call(changes, 'fullName')) {
        sets.push('full_name = ?');
        values.push(changes.fullName);
      }
      if (Object.prototype.hasOwnProperty.call(changes, 'email')) {
        sets.push('email = ?');
        values.push(changes.email);
      }
      if (Object.prototype.hasOwnProperty.call(changes, 'role')) {
        sets.push('role = ?');
        values.push(changes.role);
      }
      if (Object.prototype.hasOwnProperty.call(changes, 'suspended')) {
        sets.push('suspended = ?');
        values.push(changes.suspended ? 1 : 0);
      }
      if (Object.prototype.hasOwnProperty.call(changes, 'uploadQuotaBytes')) {
        if (changes.uploadQuotaBytes === null) {
          sets.push('upload_quota_bytes = NULL');
        } else {
          sets.push('upload_quota_bytes = ?');
          values.push(changes.uploadQuotaBytes);
        }
      }
      if (Object.prototype.hasOwnProperty.call(changes, 'accentColor')) {
        sets.push('accent_color = ?');
        values.push(changes.accentColor);
      }
      if (Object.prototype.hasOwnProperty.call(changes, 'workspaceLogoUrl')) {
        sets.push('workspace_logo_url = ?');
        values.push(changes.workspaceLogoUrl);
      }

      if (!sets.length) return this.getById(userId);
      values.push(userId);
      db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...values);
      return this.getById(userId);
    },

    updateLastSignIn(userId, signedInAt) {
      db.prepare('UPDATE users SET last_sign_in_at = ? WHERE id = ?').run(signedInAt, userId);
    },

    updatePassword(userId, passwordHash) {
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, userId);
    },
  };
}

module.exports = {
  createUsersRepository,
};
