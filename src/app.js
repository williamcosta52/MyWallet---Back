import express, { json } from "express";
import cors from "cors";

import router from "./routes/index.routes.js";

const app = express();

app.use(cors());
app.use(json());
app.use(router);

export default app;
