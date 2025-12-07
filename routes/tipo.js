const express = require('express');
const router = express.Router();
const tipoController = require('../controllers/tipoController');
const { isAdmin } = require('../middleware/auth');

router.get('/', tipoController.getAll);
router.get('/:id', tipoController.getById);
router.post('/', isAdmin, tipoController.create);
router.put('/:id', isAdmin, tipoController.update);
router.delete('/:id', isAdmin, tipoController.delete);

module.exports = router;
