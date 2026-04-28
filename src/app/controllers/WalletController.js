import * as Yup from 'yup';
import Wallet from '../models/Wallet.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { Op } from 'sequelize';

class WalletController {
  // =========================
  // VER SALDO
  // =========================
  async show(req, res) {
    try {
      const wallet = await Wallet.findOne({
        where: { user_id: req.userId },
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'name', 'cpf'],
          },
        ],
      });

      if (!wallet) {
        return res.status(404).json({ error: 'Carteira não encontrada.' });
      }

      return res.json(wallet);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // =========================
  // BUSCAR DESTINATÁRIO PELO CPF
  // =========================
  async findUserByCpf(req, res) {
    try {
      const cpf = String(req.params.cpf).replace(/\D/g, '');

      const user = await User.findOne({
        where: { cpf },
        attributes: ['id', 'name', 'email', 'cpf'],
      });

      if (!user) {
        return res.status(404).json({
          error: 'Usuário não encontrado.',
        });
      }

      if (user.id === req.userId) {
        return res.status(400).json({
          error: 'Você não pode transferir para você mesmo.',
        });
      }

      return res.json(user);
    } catch (err) {
      return res.status(500).json({
        error: 'Erro ao buscar usuário.',
      });
    }
  }

  // =========================
  // DEPOSITAR
  // =========================
  async deposit(req, res) {
    const schema = Yup.object().shape({
      amount: Yup.number()
        .required()
        .positive()
        .typeError('O valor deve ser número'),
    });

    try {
      await schema.validate(req.body);
    } catch (err) {
      return res.status(400).json({
        error: err.errors,
      });
    }

    try {
      const { amount } = req.body;

      const wallet = await Wallet.findOne({
        where: { user_id: req.userId },
      });

      if (!wallet) {
        return res.status(404).json({
          error: 'Carteira não encontrada.',
        });
      }

      const newBalance =
        Number(wallet.balance) + Number(amount);

      await wallet.update({
        balance: newBalance,
      });

      return res.json({
        message: 'Depósito realizado!',
        balance: newBalance,
      });
    } catch (err) {
      return res.status(500).json({
        error: 'Erro ao processar depósito.',
      });
    }
  }

  // =========================
  // TRANSFERIR PIX
  // =========================
  async transfer(req, res) {
    const schema = Yup.object().shape({
      targetCpf: Yup.string()
        .required()
        .length(11)
        .matches(/^\d+$/, 'CPF inválido'),
      amount: Yup.number()
        .required()
        .positive(),
    });

    try {
      await schema.validate(req.body, {
        abortEarly: false,
      });
    } catch (err) {
      return res.status(400).json({
        error: 'Falha na validação',
        messages: err.errors,
      });
    }

    const transaction =
      await Wallet.sequelize.transaction();

    try {
      const { targetCpf, amount } = req.body;

      const senderWallet = await Wallet.findOne({
        where: { user_id: req.userId },
        transaction,
      });

      if (!senderWallet) {
        await transaction.rollback();

        return res.status(404).json({
          error: 'Carteira não encontrada.',
        });
      }

      if (
        Number(senderWallet.balance) <
        Number(amount)
      ) {
        await transaction.rollback();

        return res.status(400).json({
          error: 'Saldo insuficiente.',
        });
      }

      const recipient = await User.findOne({
        where: { cpf: targetCpf },
        include: [
          {
            model: Wallet,
            as: 'wallet',
          },
        ],
        transaction,
      });

      if (!recipient) {
        await transaction.rollback();

        return res.status(404).json({
          error: 'CPF não encontrado.',
        });
      }

      if (recipient.id === req.userId) {
        await transaction.rollback();

        return res.status(400).json({
          error:
            'Não é possível transferir para você mesmo.',
        });
      }

      await senderWallet.update(
        {
          balance:
            Number(senderWallet.balance) -
            Number(amount),
        },
        { transaction }
      );

      await recipient.wallet.update(
        {
          balance:
            Number(recipient.wallet.balance) +
            Number(amount),
        },
        { transaction }
      );

      await Transaction.create(
        {
          sender_id: req.userId,
          recipient_id: recipient.id,
          amount,
          type: 'TRANSFER',
        },
        { transaction }
      );

      await transaction.commit();

      return res.json({
        message: 'Pix enviado!',
        sent_to: recipient.name,
        amount,
      });
    } catch (err) {
      await transaction.rollback();

      return res.status(500).json({
        error: 'Erro interno na transferência.',
      });
    }
  }

  // =========================
  // EXTRATO
  // =========================
  async index(req, res) {
    try {
      const transactions =
        await Transaction.findAll({
          where: {
            [Op.or]: [
              { sender_id: req.userId },
              { recipient_id: req.userId },
            ],
          },
          order: [['created_at', 'DESC']],
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['name', 'cpf'],
            },
            {
              model: User,
              as: 'recipient',
              attributes: ['name', 'cpf'],
            },
          ],
        });

      return res.json(transactions);
    } catch (err) {
      return res.status(500).json({
        error: 'Erro ao buscar extrato.',
      });
    }
  }
}

export default new WalletController();