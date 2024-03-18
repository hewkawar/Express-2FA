var tfa = require('2fa');

const getKey = require("./getKey")

module.exports = async function (service_id, user, code) {
    const key = await getKey(service_id, user);

    if (tfa.verifyTOTP(key, code)) return true
    else return false
}