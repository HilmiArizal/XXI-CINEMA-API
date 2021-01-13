const database = require("../Database");
const { createJWTToken } = require("../Helper/jwt");
const transporter = require("../Helper/nodemailer");
const Crypto = require('crypto');
const { uploader } = require("../Helper/uploader-img");
const fs = require('fs');

module.exports = {
    getAllUsers: (req, res) => {
        const queryGetAllUsers = `SELECT * FROM users`;
        database.query(queryGetAllUsers, (err, resultsGetAllUsers) => {
            if (err) return res.status(500).send(err)

            res.status(200).send(resultsGetAllUsers)
        })
    },
    register: (req, res) => {
        const { email, username, password, confirmPassword } = req.body;
        if (!email || !username || !password || !confirmPassword) return res.status(500).send('Fill in the form correctly!');
        if (password !== confirmPassword) return res.status(500).send('Your password not same!');

        const queryGetUser = `SELECT * FROM users`;
        database.query(queryGetUser, (err, resultsGetUser) => {
            if (err) return res.status(500).send(err)

            for (var i = 0; i < resultsGetUser.length; i++) {
                let resultsGetEmail = resultsGetUser[i].email;
                if (resultsGetEmail === email) return res.status(500).send('Email has been taken!')
                let resultsGetUsername = resultsGetUser[i].username;
                if (resultsGetUsername === username) return res.status(500).send('Username has been taken!')
            }

            const hashPassword = Crypto.createHash('sha256').update(password).digest('hex')

            const queryPostUser = `INSERT INTO users (email, username, password, role, status) VALUES ('${email}', '${username}', '${hashPassword}', 'user', 'unverified')`;
            database.query(queryPostUser, (err, resultsPostUser) => {
                if (err) return res.status(500).send(err)

                res.status(200).send(resultsPostUser);
            })
        })
    },
    login: (req, res) => {
        const { username, password } = req.body;
        if (!username || !password) return res.status(500).send('Fill in the form correctly!');

        const hashPassword = Crypto.createHash('sha256').update(password).digest('hex');

        const queryPostLogin = `SELECT * FROM users WHERE username = '${username}' OR email = '${username}'`;
        database.query(queryPostLogin, (err, resultsPostLogin) => {
            if (err) return res.status(500).send(err)

            if (resultsPostLogin.length === 0) return res.status(500).send('User not find!');
            if (hashPassword !== resultsPostLogin[0].password) return res.status(500).send('Password wrong!')

            const token = createJWTToken({ ...resultsPostLogin[0] })

            res.status(200).send(({ ...resultsPostLogin[0], token }))
        })
    },
    keepLogin: (req, res) => {
        const queryPostKeepLogin = `SELECT * FROM users WHERE iduser = ${req.user.iduser}`;
        database.query(queryPostKeepLogin, (err, resultsPostKeepLogin) => {
            if (err) return res.status(500).send(err)

            const token = createJWTToken({ ...resultsPostKeepLogin[0] })
            res.status(200).send({ ...resultsPostKeepLogin[0], token })
        })
    },
    resendEmail: (req, res) => {
        const queryGetUser = `SELECT * FROM users WHERE iduser = ${req.user.iduser}`;
        database.query(queryGetUser, (err, resultsGetUser) => {

            const token = createJWTToken({ ...resultsGetUser[0] })

            let verification = `http://localhost:3000/verified?token=${token}`

            let mailOption = {
                from: `Hilmi Admin <hilmi.arizal36@gmail.com>`,
                to: resultsGetUser[0].email,
                subject: `Resend Email Verification`,
                html: `Link untuk verifikasi <a href=${verification}>disini </a>`
            }

            transporter.sendMail(mailOption, (err, resultsResendMail) => {
                if (err) return res.status(500).send(err)

                res.status(200).send(resultsResendMail)
            })
        })
    },
    emailVerification: (req, res) => {
        const queryPatchStatus = `UPDATE users SET status = 'verified' WHERE iduser = ${req.user.iduser};`
        database.query(queryPatchStatus, (err, resultsPatchStatus) => {
            if (err) return res.status(500).send(err)

            res.status(200).send(resultsPatchStatus)
        })
    },
    changePassword: (req, res) => {
        const { oldPassword, password, confirmPassword } = req.body;

        const hashOldPassword = Crypto.createHash('sha256').update(oldPassword).digest('hex');
        const hashPassword = Crypto.createHash('sha256').update(password).digest('hex');

        if (!oldPassword || !password || !confirmPassword) return res.status(500).send('Fill in the form correctly!');
        if (password !== confirmPassword) return res.status(500).send('Yout password not same!');

        const queryGetUser = `SELECT * FROM users WHERE iduser = ${req.user.iduser}`;
        database.query(queryGetUser, (err, resultsGetUser) => {
            if (err) return res.status(500).send(err)

            if (hashOldPassword !== resultsGetUser[0].password) return res.status(500).send('Old Password wrong!');
            if (hashPassword === resultsGetUser[0].password) return res.status(500).send('Password not change!');

            const queryPatchPassword = `UPDATE users SET password = '${hashPassword}' WHERE iduser = ${req.user.iduser}`;
            database.query(queryPatchPassword, (err, resultsPatchPassword) => {
                if (err) return res.status(500).send(err)

                res.status(200).send(resultsPatchPassword)
            })
        })
    },

    // ADMIN

    getProfileAdmin: (req, res) => {
        const queryGetProfileAdmin = `SELECT * FROM profileadmin WHERE userId = ${req.user.iduser}`;
        database.query(queryGetProfileAdmin, (err, resultsGetProfileAdmin) => {
            if (err) return res.status(500).send(err)

            res.status(200).send(resultsGetProfileAdmin)
        })
    },
    getProfileAdminByUser:(req, res) => {
        const queryGetProfileAdminByUser = `SELECT * FROM profileadmin WHERE userId = ${req.user.iduser}`;
        database.query(queryGetProfileAdminByUser, (err, resultsGetProfileAdminByUSer) => {
            if(err) return res.status(500).send(err)

            res.status(200).send(resultsGetProfileAdminByUSer[0])
        })
    },
    addProfileAdmin: (req, res) => {
        const path = '/imageprofile';
        const upload = uploader(path, 'IMG').fields([{ name: 'imageprofile' }])
        upload(req, res, (err) => {
            if (err) return res.status(500).send(err)

            const { imageprofile } = req.files;
            const imagePath = imageprofile ? path + '/' + imageprofile[0].filename : null;

            const data = JSON.parse(req.body.dataProfileAdmin);
            data.imageprofile = imagePath;
            data.userId = req.user.iduser;

            const queryAddProfileAdmin = `INSERT INTO profileadmin SET ?`;
            database.query(queryAddProfileAdmin, data, (err, resultsPostProfileAdmin) => {
                if (err) return res.status(500).send(err)

                res.status(200).send(resultsPostProfileAdmin)
            })
        })
    },
    editProfileAdmin: (req, res) => {
        try{

            const path = '/imageprofile';
            const upload = uploader(path, 'IMG').fields([{ name: 'imageprofile' }])
            upload(req, res, (err) => {
                if (err) return res.status(500).send(err)
                
                const { imageprofile } = req.files;
                const imagePath = imageprofile ? path + '/' + imageprofile[0].filename : null;
                
                const data = JSON.parse(req.body.dataProfileAdmin);
                data.imageprofile = imagePath;
                data.userId = req.user.iduser;
                
                const { fullname, nickname } = data;
                const changeImage = data.changeImage;
                
                const queryAddProfileAdmin = `UPDATE profileadmin SET fullname = '${fullname}', nickname = '${nickname}' WHERE userId = ${req.user.iduser}`;
                database.query(queryAddProfileAdmin, data, (err, resultsPostProfileAdmin) => {
                if (err) return res.status(500).send(err)
                
                const queryGetProfileAdmin = `SELECT * FROM profileadmin WHERE userId = ${req.user.iduser}`;
                database.query(queryGetProfileAdmin, (err, resultsGetProfileAdmin) => {
                    if (err) {
                        return res.status(500).send(err)
                    } else if (resultsGetProfileAdmin !== 0) {
                        if (changeImage) {
                            
                            const queryEditProfileImage = `UPDATE profileadmin SET imageprofile = '${data.imageprofile}' WHERE userId = ${req.user.iduser}`;
                            database.query(queryEditProfileImage, (err, resultsEditProfileImage) => {
                                if (err) return res.status(500).send(err)
                                
                                if (imageprofile) {
                                    if (resultsGetProfileAdmin[0].imageprofile === 0) {
                                        return null
                                    } else {
                                        fs.unlinkSync('./Public' + resultsGetProfileAdmin[0].imageprofile)
                                    }
                                }
                                res.status(200).send(resultsPostProfileAdmin)
                            })
                        } else {
                            res.status(200).send(resultsPostProfileAdmin)
                        }
                    }
                })
                // res.status(200).send(resultsPostProfileAdmin)
            })
        })
    }catch(err){
        console.log(err)
    }
    }

}