const express = require('express');
const router = express.Router();
const tamanhoController = require('../controllers/tamanhoController');
const { isAdmin } = require('../middleware/auth');

router.get('/', tamanhoController.getAll);
router.get('/:id', tamanhoController.getById);
router.post('/', isAdmin, tamanhoController.create);
router.put('/:id', isAdmin, tamanhoController.update);
router.delete('/:id', isAdmin, tamanhoController.delete);

module.exports = router;
