const express = require('express');
const {
    addItem,
    getItems,
} = require('../controller/itemController');

const router = express.Router();

router.post('/add', addItem);
router.get('/get', getItems);


module.exports = router;