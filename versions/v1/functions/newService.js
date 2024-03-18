const database = require('../../../database');

module.exports = async function (name) {
    return new Promise((resolve, reject) => {
        database.query("INSERT INTO `service`(`name`) VALUES (?)", [name], (err, results) => {
            if (err) {
                console.error("Error executing MySQL query:", err);
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}