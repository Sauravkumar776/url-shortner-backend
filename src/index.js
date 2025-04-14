const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const connectMongo = require('./config/db');
const routes = require('./routes'); 

app.use(express.json());
app.use('/', routes);

connectMongo().then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server running at http://localhost:${process.env.PORT}`);
    });
  });