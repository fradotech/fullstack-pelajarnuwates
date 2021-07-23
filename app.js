const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const { get } = require('mongoose')

require('./utils/db')
const User = require('./model/user')
const Admin = require('./model/admin')

const app = express()
const port = process.env.PORT || 3000

app.set('view engine', 'ejs')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(
    session({
        cookie: { maxAge: 6000 },
        secret: 'secret',
        resave: true,
        saveUninitialized: true,
    })
)

app.post('/login', (req, res) => {
    let email = req.body.email
    let password = req.body.password

    const getUser = Admin.findOne({ email: email })
        .then(getUser => {
            if (getUser) {
                if (password === getUser.password) {
                    token = jwt.sign({ email: getUser.email }, 'fradotech20012021.01082000.20052003', { expiresIn: '60m' })

                    res.cookie('token', token)
                    res.cookie('admin', getUser)

                    res.redirect('/')

                } else {
                    res.render('login', {
                        layout: 'layouts/main-layout',
                        title: 'Pelajar NU Wates',
                        message: 'Password salah! Coba lagi!',
                        messageClass: 'alert-danger',
                        user: null
                    })
                }
            } else {
                res.render('login', {
                    layout: 'layouts/main-layout',
                    title: 'Pelajar NU Wates',
                    message: 'Email salah! Coba lagi!',
                    messageClass: 'alert-danger',
                    user: null
                })
            }
        })
})

//User

app.use(async (req, res, next) => {
    const token = await req.cookies['token']
    req.admin = await req.cookies['admin']
    if (req.admin) {
        next()
    } else {
        res.render('login', {
            layout: 'layouts/main-layout',
            title: 'Pelajar NU Wates',
            message: 'Anda perlu login dahulu!',
            messageClass: 'alert-danger',
            admin: null
        })
    }
})

app.get('/', (req, res) => {
    User.find().sort({ 'data.nama': 1 }).then(users => {
        res.render('index', {
            layout: 'layouts/main-layout',
            title: 'Pelajar NU Wates',
            admin: req.admin,
            users
        })
    })
})

// app.post('/filter', async (req, res) => {
//     let users
//     const filter = {
//         periode: req.body.periode,
//         ranting: req.body.ranting
//     }

//     if (filter.periode == 'Semua' && filter.ranting == 'Semua') {
//         users = await User.find().sort({ 'data.nama': 1 })

//     } else if (filter.periode == 'Semua') {
//         users = await User.find({ 'data.ranting': req.body.ranting }).sort({ 'data.nama': 1 })

//     } else if (filter.ranting == 'Semua') {
//         users = await User.find({ 'data.periode': req.body.periode }).sort({ 'data.nama': 1 })

//     } else {
//         users = await User.find({ 'data.periode': req.body.periode, 'data.ranting': req.body.ranting }).sort({ 'data.nama': 1 })
//     }

//     res.render('filter', {
//         layout: 'layouts/main-layout',
//         title: 'Pelajar NU Wates',
//         admin: req.admin,
//         users,
//         filter
//     })
    
// })

app.get('/edit-profile/:id', (req, res) => {
    const user = User.findOne({ _id: req.params.id })
    .then(user => {
        res.render('edit-profile', {
            layout: 'layouts/main-layout',
            title: 'Pelajar NU Wates',
            admin: req.admin,
            user
        })
    })
})

app.post('/edit-profile/:id', (req, res) => {
    const getUser = User.findOne({ _id: req.params.id })
        .then(getUser => {
            let makesta = ''
            let lakmud = ''
            let lakud = ''

            if (req.body.makesta) {
                makesta = req.body.makesta + ' ' + req.body.makestaTahun + ', '
            }
            if (req.body.lakmud) {
                lakmud = req.body.lakmud + ' ' + req.body.lakmudTahun + ', '
            }
            if (req.body.lakud) {
                lakud = req.body.lakud + ' ' + req.body.lakudTahun
            }

            const user = {
                email: getUser.email,
                password: getUser.password,
                data: {
                    nama: req.body.name,
                    alamat: req.body.alamat,
                    periode: req.body.periode,
                    phone: req.body.phone,
                    ttl: req.body.ttl,
                    ranting: req.body.ranting,
                    pendidikan: req.body.pendidikan,
                    pendidikanSkrng: req.body.pendidikanSkrng,
                    kader: makesta + lakmud + lakud,
                    pelatihan: req.body.pelatihan,
                }
            }

            User.findOneAndUpdate({ _id: getUser._id }, user, { new: true }, async (err, doc) => {
                if (!err) {
                    res.redirect('/')
                }
                else {
                    console.log(err)
                }
            })
        })
})

app.get('/logout', (req, res) => {
    cookie = req.cookies
    for (let prop in cookie) {
        if (!cookie.hasOwnProperty(prop)) {
            continue
        }
        res.cookie(prop, '', { expires: new Date(0) })
    }
    res.redirect('/')
})

app.listen(port)