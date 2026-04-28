import { Router } from "express";
import UserControllers from "./app/controllers/UserControllers.js";
import SessinControllers from "./app/controllers/SessinControllers.js";
import WalletController from "./app/controllers/WalletController.js";
import authMiddleware from "./app/middlewares/auth.js";

const router = new Router();

router.post("/users", UserControllers.store);
router.post("/session", SessinControllers.store);

router.use(authMiddleware);

router.get("/users/cpf/:cpf", WalletController.findUserByCpf);

router.get("/wallet", WalletController.show);
router.post("/wallet/deposit", WalletController.deposit);

router.get("/transactions", WalletController.index);
router.post("/transfer", WalletController.transfer);

export default router;