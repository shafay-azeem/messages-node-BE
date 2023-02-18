const User = require('../models/user')
const { validationResult } = require('express-validator/check')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.signup = (req, res, next) => {
    const error = validationResult(req)
    if (!error.isEmpty()) {
        const err = new Error('Validation failed')
        err.statusCode = 422
        err.data = err.array()
        throw err
    }
    const name = req.body.name
    const email = req.body.email
    const password = req.body.password
    bcrypt.hash(password, 12).then(hashPassword => {
        const user = new User({
            name: name,
            email: email,
            password: hashPassword

        })
        return user.save()
    }).then(user => {
        res.status(201).json({ message: 'user created successfuly', userId: user._id })
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    })

}

exports.login = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    console.log(email, 'email')
    let loadedUser
    User.findOne({ email: email }).then(user => {
        if (!user) {
            const error = new Error('user doesnt find with this email')
            error.statusCode = 401
            throw error
        }
        loadedUser = user
        return bcrypt.compare(password, loadedUser.password)
    }).then(isEqual => {
        if (!isEqual) {
            const error = new Error('Password is incorrect')
            error.statusCode = 401
            throw error
        }
        // console.log(loadedUser, 'loadedUser')
        const token = jwt.sign({ email: loadedUser.email, userId: loadedUser._id.toString() }, "ihatepotatoes", { expiresIn: '1h' })
        res.status(200).json({
            message: 'Logged In',
            userId: loadedUser._id.toString(),
            token: token
        })
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    })

}