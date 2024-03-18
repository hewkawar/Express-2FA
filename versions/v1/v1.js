const express = require('express');
var tfa = require('2fa');
const fs = require('fs');
const path = require('path');
const extension = require('./types/Extension.json');

const router = express.Router();

const getService = require('./functions/getService');
const getKey = require('./functions/getKey');
const newKey = require('./functions/newKey');
const verifyCode = require('./functions/verifyCode');
const newService = require('./functions/newService');
const editService = require('./functions/editService');
const deleteService = require('./functions/deleteService');
const deleteKey = require('./functions/deleteKey');

const tempFolder = path.join(__dirname, 'temp');

fs.access(tempFolder, fs.constants.F_OK, (err) => {
    if (err) {
        // Directory doesn't exist, create it
        fs.mkdir(tempFolder, { recursive: true }, (err) => {
            if (err) {
                console.error('Error creating directory:', err);
            }
        });
    }
});

router.post('/key', async (req, res) => {
    const { service_id, user } = req.body;

    if (!service_id) return res.status(400).json({ error: "Invalid service_id" });
    if (!user) return res.status(400).json({ error: "Invalid user" });

    const service = await getService(service_id);

    if (!service) return res.status(400).json({ error: "Unknow service" });

    const userKey = await getKey(service_id, user);

    if (!userKey) {
        tfa.generateKey(32, function (err, key) {
            newKey(service_id, user, key);

            return res.status(201).json({
                message: `Generated key for ${user}`
            });
        });
    } else {
        return res.status(200).json({
            message: `Already have key for ${user}`
        });
    }
});

router.delete('/key', async (req, res) => {
    const { service_id, user } = req.body;

    if (!service_id) return res.status(400).json({ error: "Invalid service_id" });
    if (!user) return res.status(400).json({ error: "Invalid user" });

    const service = await getService(service_id);

    if (!service) return res.status(400).json({ error: "Unknow service" });

    const key = await getKey(service_id, user);

    if (key) {
        deleteKey(service_id, user);

        return res.status(204);
    } else return res.status(204).json({ message: `Doesn't have key for ${user}` });
});

router.get('/qrcode', async (req, res) => {
    const { service_id, user, type } = req.query;

    if (!service_id) return res.status(400).send("Invalid service_id")
    if (!user) return res.status(400).send("Invalid user")

    const service = await getService(service_id);

    if (!service) return res.status(400).send("Unknow service")

    const key = await getKey(service_id, user);

    if (key) {
        tfa.generateGoogleQR(service.name, user, key, function (err, qr) {
            if (type.toLowerCase() == extension.json) return res.json({ data: qr });
            else if (type.toLowerCase() == extension.png || type.toLowerCase() == extension.jpg || type.toLowerCase() == extension.jpeg) {
                const matches = qr.match(/^data:image\/png;base64,(.+)$/);

                if (!matches) {
                    return res.status(400).send("Invalid QR code format");
                }

                const pngData = matches[1];
                const buffer = Buffer.from(pngData, 'base64');

                // You can adjust the file extension based on the type parameter
                const fileExtension = type.toLowerCase() === 'jpeg' || type.toLowerCase() === 'jpg' ? 'jpg' : 'png';

                const tempFilePath = path.join(__dirname, 'temp', `qrcode_${service_id}_${encodeURIComponent(user)}.${fileExtension}`);

                fs.writeFileSync(tempFilePath, buffer);
                return res.sendFile(tempFilePath, {}, (err) => {
                    fs.unlinkSync(tempFilePath);
                    if (err) {
                        console.error('Error sending file:', err);
                        res.status(err.status || 500).send('Error sending file');
                    }
                });
            } else {
                return res.send(qr)
            }
        });
    } else {
        return res.json({
            error: `Doesn't have key for ${user}`
        })
    }
});

router.post('/verify', async (req, res) => {
    const { service_id, user } = req.query;
    const { code } = req.body;

    if (!service_id) return res.status(400).json({ error: "Invalid service_id" });
    if (!user) return res.status(400).json({ error: "Invalid user" });
    if (!code) return res.status(400).json({ error: "Invalid code" });

    const service = await getService(service_id);

    if (!service) return res.status(400).json({
        error: "Unknow service"
    });

    const ok = await verifyCode(service_id, user, code);

    if (ok) return res.json({
        verify: true,
    });
    else return res.status(400).json({
        verify: false
    })
});

router.post('/service', async (req, res) => {
    const { name } = req.body;

    const service = await newService(name);

    if (service) return res.status(201).json({
        service_id: service.insertId,
        name: name,
    });
    else return res.status(500).json({
        error: "Can't insert to database"
    });
});

router.patch('/service', async (req, res) => {
    const { service_id, new_name } = req.body;

    if (!service_id) return res.status(400).json({ error: "Invalid service_id" });
    if (!new_name) return res.status(400).json({ error: "Invalid new_name" });

    const service = await getService(service_id);

    if (!service) return res.status(400).json({
        error: "Unknow service"
    });

    const new_service = await editService(service_id, new_name);

    if (new_service) return res.status(200).json({
        service_id: service_id,
        name: new_name,
    });
    else return res.status(500).json({
        error: "Can't update data to database"
    });
});

router.delete('/service', async (req, res) => {
    const { service_id } = req.body;

    if (!service_id) return res.status(400).json({ error: "Invalid service_id" });

    const service = await getService(service_id);

    if (!service) return res.status(400).json({
        error: "Unknow service"
    });

    const delete_service = await deleteService(service_id);

    if (delete_service) return res.status(204).json({
        service_id: service_id
    })
});

module.exports = router;