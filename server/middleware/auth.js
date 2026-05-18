const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fitconnect-dev-secret-change-me';
const TOKEN_TTL = '7d';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

// Requires a valid Bearer token; populates req.user = { userId, role, trainerId }.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Your session is invalid or has expired.' });
  }
}

// Must run after requireAuth. Ensures the caller owns the trainer profile in :id.
function requireTrainerOwner(req, res, next) {
  const trainerId = Number(req.params.id);
  if (req.user.role === 'admin') return next();
  if (req.user.trainerId !== trainerId) {
    return res.status(403).json({ error: 'You can only manage your own profile.' });
  }
  next();
}

module.exports = { signToken, requireAuth, requireTrainerOwner, JWT_SECRET };
