import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import authConfig from '../../config/authConfig.js';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  // O header vem como "Bearer TOKEN", vamos pegar só o TOKEN
  const [, token] = authHeader.split(' ');

  try {
    // Substitua 'SEU_SECRET_AQUI' pela mesma chave que você usa no SessionController
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    // AQUI É ONDE A MÁGICA ACONTECE:
    // Pegamos o ID que estava dentro do token e colocamos no req.userId
    req.userId = decoded.id;

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};