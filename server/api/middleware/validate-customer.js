module.exports = (req, res, next) => {

    req.checkBody('first_name', 'First Name field cannot be empty.').notEmpty();
    req.checkBody('last_name', 'Last Name field cannot be empty.').notEmpty();
    req.checkBody('father_name', 'Father Name field cannot be empty.').notEmpty();
    req.checkBody('pan_number', 'Pan Number field cannot be empty.').notEmpty();
    req.checkBody('pan_number', 'The Pan Number you entered is invalid, Please try again.').matches(/^[a-zA-Z]{3}[PCHFATBLJG]{1}[a-zA-Z]{1}[0-9]{4}[a-zA-Z]{1}$/);
    req.checkBody('dob', 'Date of birth field cannot be empty.').notEmpty();
    req.checkBody('dob', 'Invalid date of birth format.').matches(/^\d{4}[\/.]\d{1,2}[\/.]\d{1,2}$/);
    req.checkBody('gender', 'Gender field cannot be empty.').notEmpty();
    req.checkBody('email', 'Email field cannot be empty.').notEmpty();
    req.checkBody('email', 'The email you entered is invalid, Please try again.').isEmail();
    req.checkBody('address', 'Address field cannot be empty.').notEmpty();


    const errors = req.validationErrors();

    if (errors) {
        let response_errors = { errors: [] };
        errors.forEach(function (err) {
            response_errors.errors.push(err.msg);
        });
        return res.status(500).json(response_errors);
    }

    if (typeof (req.file) === 'undefined') {
        return res.status(500).json({
            errors: ["Profile Image cannot be empty"]
        });
    }


    next();
};