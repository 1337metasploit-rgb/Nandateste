const express = require('express');
const router = express.Router();
const saborController = require('../controllers/saborController');
const { isAdmin } = require('../middleware/auth');

router.get('/', saborController.getAll);
router.get('/:id', saborController.getById);
router.post('/', isAdmin, saborController.create);
router.put('/:id', isAdmin, saborController.update);
router.delete('/:id', isAdmin, saborController.delete);

module.exports = router;
