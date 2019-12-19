const db = require("../../db");


exports.customer_get_all = (req, res) => {
    db.query("SELECT * FROM customers", (error, result) => {
        res.status(200).send(result);
    });
}

exports.customer_get = (req, res) => {
  db.query("SELECT * FROM customers WHERE id= ? ",[req.params.id], (error, result) => {
    res.status(200).send(result);
  });
};


exports.customer_add = (req, res) => {

    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const father_name = req.body.father_name;
    const pan_number = req.body.pan_number;
    const dob = req.body.dob;
    const gender = req.body.gender;
    const email = req.body.email;
    const address = req.body.address;
    const profile_image = req.file.path;

    db.query("INSERT INTO customers(first_name, last_name, father_name, pan_number, dob, gender, email, address, profile_image) VALUES (?,?,?,?,?,?,?,?,?)", [first_name, last_name, father_name, pan_number, dob, gender,email, address, profile_image], (error, result) => {
        if (error) {
            return res.status(500).json({
                error: error.sqlMessage
            })
        }

        res.status(200).json({
            message: 'Customer added successfully.'
        });
    });

}