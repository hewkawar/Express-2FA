const database = require('../../../database');

module.exports = async function(service_id, user) {
    return new Promise((resolve, reject) => {
        database.query("DELETE FROM `user_key` WHERE `service_id`= ? AND `user` = ?", [service_id, user], (err, results) => {
            if (err) {
                console.error("Error executing MySQL query:", err);
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};