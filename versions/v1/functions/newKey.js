const database = require('../../../database');

module.exports = async function(service_id, user, key) {
    return new Promise((resolve, reject) => {
        database.query("INSERT INTO `user_key`(`service_id`, `user`, `key`) VALUES (?, ?, ?)", [service_id, user, key], (err, results) => {
            if (err) {
                console.error("Error executing MySQL query:", err);
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}