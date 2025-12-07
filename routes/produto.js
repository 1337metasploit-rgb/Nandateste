const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');
const { isAdmin } = require('../middleware/auth');

router.get('/', produtoController.getAll);
router.get('/:id', produtoController.getById);
router.post('/', isAdmin, produtoController.create);
router.put('/:id', isAdmin, produtoController.update);
router.delete('/:id', isAdmin, produtoController.delete);

module.exports = router;
