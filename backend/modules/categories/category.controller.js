const categoryService = require('./category.service');

exports.getCategories = async (req, res, next) => {
  try {
    const { type } = req.query;
    const categories = await categoryService.getCategories(req.user._id, type);
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id, req.user._id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.user._id, req.body);
    res.status(201).json({ success: true, message: 'Category created successfully', data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.user._id, req.body);
    res.status(200).json({ success: true, message: 'Category updated successfully', data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.id, req.user._id);
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
