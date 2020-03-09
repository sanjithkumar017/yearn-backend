const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const { validateSignupOrLogin } = require('./utils/validators');
const firebaseConfig = require('./utils/firebaseConfig.js');

const app = require('express')();

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

app.post('/signup', (request, response) => {
    const newUser = {
        email: request.body.email,
        password: request.body.password,
    }

    const { valid, errors } = validateSignupOrLogin(newUser);
    if (!valid) {
        return response.status(400).json({ errors });
    }

    firebase
        .auth()
        .createUserWithEmailAndPassword(newUser.email, newUser.password)
        .then((data) => {
            return response.status(200).json({ message: `user ${data.user.uid} signed up successfully.` })
        })
        .catch(err => {
            console.error(err);
            switch (err.code) {
                case 'auth/email-already-in-use': return response.status(400).json({ error: err });
                    break;
                case 'auth/invalid-email': return response.status(400).json({ error: err });
                    break;
                case 'auth/operation-not-allowed': return response.status(400).json({ error: err });
                    break;
                case 'auth/weak-password': return response.status(400).json({ error: err });
                    break;

                default: return response.status(500).json({ error: err });
            }

        })

})

app.post('/login', (request, response) => {
    const user = {
        email: request.body.email,
        password: request.body.password,
    }

    const { valid, errors } = validateSignupOrLogin(user);
    if (!valid) {
        return response.status(400).json({ errors });
    }

    firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
            return data.user.getIdToken()
        })
        .then(token => {
            return response.json({ token })
        })
        .catch(err => {
            console.error(err);
            switch (err.code) {
                //auth/wrong-password
                //auth/user-not-found
                case 'auth/wrong-password': return response.status(400).json({ error: err });
                    break;
                case 'auth/user-not-found': return response.status(400).json({ error: err });
                    break;

                default: return response.status(500).json({ error: err });
            }

        })

})

exports.api = functions.region('asia-east2').https.onRequest(app);