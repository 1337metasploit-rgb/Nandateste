const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');
const { isAdmin } = require('../middleware/auth');

router.get('/', categoriaController.getAll);
router.get('/:id', categoriaController.getById);
router.post('/', isAdmin, categoriaController.create);
router.put('/:id', isAdmin, categoriaController.update);
router.delete('/:id', isAdmin, categoriaController.delete);

module.exports = router;
