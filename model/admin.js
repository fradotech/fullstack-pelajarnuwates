const mongoose = require('mongoose')

const Admin = mongoose.model('Admin', {
    nama: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
})

module.exports = Admin