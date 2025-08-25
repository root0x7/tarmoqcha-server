var express = require('express');
var router = express.Router();
const tunnel = require('./../controllers/TunnelController')

/* GET home page. */
router.post('/tunnels', (req, res) => tunnel.getTunells(req, res));
router.get('/tunnels/:subdomain', (req, res) => tunnel.getTunnel(req, res));

module.exports = router;
