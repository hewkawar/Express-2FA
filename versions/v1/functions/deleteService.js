const database = require('../../../database');

module.exports = async function(service_id) {
    return new Promise((resolve, reject) => {
        database.query("DELETE FROM `service` WHERE `id` = ?", [service_id], (err, results) => {
            if (err) {
                console.error("Error executing MySQL query:", err);
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};