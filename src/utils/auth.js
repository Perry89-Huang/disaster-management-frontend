import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your_jwt_secret_key_minimum_32_characters_long';

export const generateToken = (user) => {
  return jwt.sign(
    {
      'https://hasura.io/jwt/claims': {
        'x-hasura-allowed-roles': [user.role],
        'x-hasura-default-role': user.role,
        'x-hasura-user-id': user.id,
      },
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const getTokenFromStorage = () => {
  return localStorage.getItem('token');
};

export const setTokenToStorage = (token) => {
  localStorage.setItem('token', token);
};

export const removeTokenFromStorage = () => {
  localStorage.removeItem('token');
};