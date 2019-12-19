const jwt = require("jsonwebtoken");
const db = require("../../db");

//LOGIN USER
exports.user_login = (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    db.query('SELECT id FROM users WHERE (username = ? or email = ?) and password = ?', 
    [username, email, password],
    (error, result) => {

        if(result.length < 1) {
            return res.status(401).json({
                message: "Authentication failed"
            })
        }

        if (result) {
            const token = jwt.sign({
                email: email,
                userId: result[0]['id']
            },
                "secret", {
                    expiresIn: "1hr" //Expire token in 1hour
                }
            );

            return res.status(200).json({
                message: "Authentication Successful",
                token: token
            });
        }

        return res.status(401).json({
            message: "Authentication failed"
        });
    });

}