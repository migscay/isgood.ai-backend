const bcrypt = require('bcryptjs')
const xss = require('xss')

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/

const UsersService = {
    hasUserWithEmail(db, email) {
        return db('user')
        .where({ email })
        .first()
        .then(user => !!user)
    },
    insertUser(db, newUser) {
        return db
        .insert(newUser)
        .into('user')
        .returning('*')
        .then(([user]) => user)
    },
    validatePassword(password) {
        if (password.length < 8) {
        return 'Password be longer than 8 characters'
        }
        if (password.length > 72) {
        return 'Password be less than 72 characters'
        }
        if (password.startsWith(' ') || password.endsWith(' ')) {
        return 'Password must not start or end with empty spaces'
        }
        if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
        return 'Password must contain one upper case, lower case, number and special character'
        }
        return null
    },
    hashPassword(password) {
        return bcrypt.hash(password, 12)
    },
    serializeUser(user) {
        return {
        userId: user.userId,
        firstName: xss(user.firstName),
        lastName: xss(user.lastName),
        email: xss(user.email),
        createdAt: new Date(user.createdAt),
        status: true
        }
    }
}

module.exports = UsersService