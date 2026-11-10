const express = require('express');
const router = express.Router();
const categoryController = require('./category.controller');
const { authenticate } = require('../../middleware/auth');

router.use(authenticate);

router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
