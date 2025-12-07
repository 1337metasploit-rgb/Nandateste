const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

router.get('/', isAuthenticated, pedidoController.getAll);
router.post('/', isAuthenticated, pedidoController.create);
router.put('/:id', isAdmin, pedidoController.update);
router.get('/stats', isAdmin, pedidoController.getStats);

module.exports = router;
