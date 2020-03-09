const { isEmail, isPassword } = require('./helpers');

exports.validateSignupOrLogin = ({ email = '', password = '' }) => {
    const errors = {};
    if (!isEmail(email)) {
        errors['email'] = "invalid email."
    }

    if (!isPassword(password)) {
        errors['password'] = "invalid password."
    }

    if (Object.keys(errors).length > 0)
        return { valid: false, errors };

    return { valid: true };

}