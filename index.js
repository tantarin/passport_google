const express = require('express');
const app = express();
const port = 8081;
const path = require('path');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const passport = require('passport');

app.use(session({ secret: "supersecret", resave: true, saveUninitialized: true }));

let Users = [{'login': 'admin', 'email':'Aks-fam@yandex.ru'},
            {'login': 'local_js_god', 'email':'ilia-gossoudarev@yandex.ru'},
    {'login': 'test_admin', 'email': 'tanyatarinsk@gmail.com'}];

const findUserByLogin = (login) => {
    return Users.find((element)=> {
        return element.login === login;
    })
}

const findUserByEmail = (email) => {
    return Users.find((element)=> {
        return element.email.toLowerCase() === email.toLowerCase();
    })
}

app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser((user, done) => {
    done(null, user.login);
  });
  //user - объект, который Passport создает в req.user
passport.deserializeUser((login, done) => {
    user = findUserByLogin(login);
        done(null, user);
});



passport.use(new GoogleStrategy({
        clientID: 'YOUR_CLIENT_ID',
        clientSecret: 'YOUR_CLIENT_SECRET',
        callbackURL: 'YOUR_CALLBACK_URL'
    },
    (accessToken, refreshToken, profile, done) => {
        let user = findUserByEmail(profile.emails[0].value);
        user.profile = profile;
        if (user) return done(null, user);

        done(true, null);
    }
));


const isAuth = (req, res, next)=> {
    if (req.isAuthenticated()) return next();

    res.redirect('/sorry');
}


app.get('/', (req, res)=> {
    res.sendFile(path.join(__dirname, 'main.html'));
});
app.get('/sorry', (req, res)=> {
    res.sendFile(path.join(__dirname, 'sorry.html'));
});
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/sorry', successRedirect: '/private' }));

app.get('/private', isAuth, (req, res)=>{
    res.send(req.user);
});



app.listen(port, () => console.log(`App listening on port ${port}!`))
