const express = require('express');
const app = express();
app.use(express.json());

require('dotenv').config();

const v1 = require('./versions/v1/v1');

app.use('/', v1);
app.use('/v1', v1);

app.listen(process.env.PORT || 3020, () => {
    console.log(`Server is running on port http://localhost:${process.env.PORT || 3020}`);
})