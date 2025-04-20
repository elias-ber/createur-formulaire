const express = require('express');
const session = require('express-session');
const passport = require('passport');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const sequelize = require('./config/sequelize');
const initModels = require('./models/init-models');
const models = initModels(sequelize);

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

app.use(require('./middlewares/sessionMiddleware'));
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
require('./config/passport')(passport);

// Router
app.use('/', require('./routes/authRoutes'));
app.use('/forms', require('./routes/formsRoutes'));
app.use('/profile', require('./routes/profileRoutes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});
