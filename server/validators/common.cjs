function normalizeEmail(email) {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 4;
}

module.exports = {
  isValidPassword,
  normalizeEmail,
};
