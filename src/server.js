import app from "./app.js";
import "./app/database/index.js";
const Port = 3000;

app.listen(Port, () => {
	console.log(`server is running on port ${Port}`);
});
