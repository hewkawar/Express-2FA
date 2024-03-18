const database = require('../../../database');

module.exports = async function(service_id, new_name) {
    return new Promise((resolve, reject) => {
        database.query("UPDATE `service` SET `name`= ? WHERE `id`= ?", [new_name, service_id], (err, results) => {
            if (err) {
                console.error("Error executing MySQL query:", err);
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}