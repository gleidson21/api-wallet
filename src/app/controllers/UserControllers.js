import { Op } from 'sequelize';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import * as Yup from 'yup';

class UserControllers {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required('O nome é obrigatório'),
      email: Yup.string().email('E-mail inválido').required('O e-mail é obrigatório'),
      cpf: Yup.string().required('O CPF é obrigatório')
      .matches(/^[0-9]+$/, 'O CPF deve conter apenas números')
      .min(11, 'O CPF deve ter exatamente 11 números')
      .max(11, 'O CPF deve ter exatamente 11 números'),
      password: Yup.string().required('A senha é obrigatória').min(6),
    });
    req.body.cpf = req.body.cpf.replace(/\D/g, '');
    try {
      await schema.validate(req.body, { abortEarly: false });

      const { name, email, cpf, password } = req.body;

      const userExist = await User.findOne({
        where: {
          [Op.or]: [{ email }, { cpf }],
        },
      });

      if (userExist) {
        return res.status(400).json({
          message: 'Email ou CPF já em uso. Tente novamente.',
        });
      }

    
      const password_hash = await bcrypt.hash(password, 10);

    
      const user = await User.create({
        name,
        email,
        cpf,
        password_hash,
      });

      return res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
      });

    } catch (err) {
      // 6. Tratamento de erros do Yup
      if (err instanceof Yup.ValidationError) {
        return res.status(400).json({ errors: err.errors });
      }

      // Erros inesperados (banco fora do ar, etc)
      console.error(err);
      return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }
}

export default new UserControllers();