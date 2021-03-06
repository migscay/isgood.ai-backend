const express = require('express')
const path = require('path')
const UsersService = require('../services/users-service')

const usersRouter = express.Router()
const jsonBodyParser = express.json()

usersRouter
  .post('/register', jsonBodyParser, (req, res, next) => {
    const { firstName, lastName, email, password } = req.body

    for (const field of ['firstName', 'lastName', 'email', 'password'])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`
        })

    // TODO: check user_name doesn't start with spaces

    const passwordError = UsersService.validatePassword(password)

    if (passwordError)
      return res.status(400).json({ error: passwordError })

    UsersService.hasUserWithEmail(
      req.app.get('db'),
      email
    )
      .then(hasUserWithEmail => {
        if (hasUserWithEmail)
          return res.status(400).json({ error: `Email already taken` })

        return UsersService.hashPassword(password)
          .then(hashedPassword => {
            const newUser = {
              firstName,
              lastName,
              email,
              password: hashedPassword,
              createdAt: 'now()',
            }

            return UsersService.insertUser(
              req.app.get('db'),
              newUser
            )
              .then(user => {
                res
                  .status(201)
                  .location(path.posix.join(req.originalUrl, `/${user.id}`))
                  .json(UsersService.serializeUser(user))
              })
          })
      })
      .catch(next)
  })

module.exports = usersRouter