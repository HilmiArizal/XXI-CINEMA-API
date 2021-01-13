const PORT = process.env.PORT || 2020;
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bearerToken = require('express-bearer-token');

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(bearerToken());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));


app.get('/', (req, res) => {
    res.send(`SERVER RUNNING IN PORT ${PORT}`)
})

const { userRouter, moviesRouter } = require('./Router');

app.use('/users', userRouter);
app.use('/movies', moviesRouter);

app.listen(PORT, () => console.log(`SERVER RUNNING IN PORT ${PORT}`))