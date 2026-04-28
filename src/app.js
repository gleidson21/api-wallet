import express from "express";
import router from "./router.js";
import cors from "cors";

class APP {
	constructor() {
		this.app = express();
		this.middlewares();
		this.router();
		
	}

	middlewares() {
		this.app.use(express.json());
		this.app.use(cors());
	}

	router() {
		this.app.use(router);
	}
}

export default new APP().app;
