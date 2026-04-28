import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import authConfig from '../../config/authConfig.js';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      identifier: Yup.string().required('E-mail ou CPF é obrigatório'),
      password: Yup.string().required('A senha é obrigatória'),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });

      const { identifier, password } = req.body;

     
      const user = await User.findOne({
        where: {
          [Op.or]: [
            { email: identifier },
            { cpf: identifier.replace(/\D/g, '') }
          ],
        },
      });

     
      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

       const passwordMatch = await bcrypt.compare(
        password,
        user.password_hash
      );

      if (!passwordMatch) {
        return res.status(401).json({ error: 'email ou cpf ou senha incorretos' });
      }

      const { id, name, email } = user;

      return res.json({
        user: {
          id,
          name,
          email,
        },
        token: jwt.sign({ id }, authConfig.secret, {
          expiresIn: authConfig.expiresIn,
        }),
      });

    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        return res.status(400).json({ errors: err.errors });
      }
      console.error(err);
      return res.status(500).json({ error: 'Erro interno no servidor' });
    }
  }
}

export default new SessionController();