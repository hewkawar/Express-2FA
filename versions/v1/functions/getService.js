const database = require('../../../database');

module.exports = async function (service_id) {
    return new Promise((resolve, reject) => {
        database.query(
            "SELECT `name`, `created_at` FROM `service` WHERE `id`= ?",
            [service_id],
            (err, results) => {
                if (err) {
                    console.error("Error executing MySQL query:", err);
                    reject(err);
                } else {
                    if (results.length === 0) {
                        resolve(null);
                    } else {
                        resolve(results[0]);
                    }
                }
            }
        );
    });
}