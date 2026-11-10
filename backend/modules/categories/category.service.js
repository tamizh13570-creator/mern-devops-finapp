const Category = require('./category.model');

class CategoryService {
  async getCategories(userId, type) {
    const query = {
      $or: [{ userId: null, isDefault: true }, { userId }],
    };

    if (type && type !== 'all') {
      query.$and = [{ $or: [{ type }, { type: 'both' }] }];
    }

    return await Category.find(query).sort({ isDefault: -1, name: 1 });
  }

  async getCategoryById(id, userId) {
    return await Category.findOne({
      _id: id,
      $or: [{ userId: null, isDefault: true }, { userId }],
    });
  }

  async createCategory(userId, data) {
    const existing = await Category.findOne({
      userId,
      name: { $regex: new RegExp(`^${data.name.trim()}$`, 'i') },
    });

    if (existing) {
      throw new Error('A category with this name already exists.');
    }

    return await Category.create({
      userId,
      name: data.name.trim(),
      icon: data.icon || '🏷️',
      color: data.color || '#667eea',
      type: data.type || 'expense',
      isDefault: false,
    });
  }

  async updateCategory(id, userId, data) {
    const category = await Category.findOne({ _id: id, userId });
    if (!category) {
      throw new Error('Category not found or cannot be modified.');
    }

    if (data.name) category.name = data.name.trim();
    if (data.icon) category.icon = data.icon;
    if (data.color) category.color = data.color;
    if (data.type) category.type = data.type;

    return await category.save();
  }

  async deleteCategory(id, userId) {
    const category = await Category.findOne({ _id: id, userId });
    if (!category) {
      throw new Error('Category not found or default categories cannot be deleted.');
    }
    await category.deleteOne();
    return true;
  }
}

module.exports = new CategoryService();
