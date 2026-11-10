/**
 * Format a number as currency string
 * @param {number} amount - Amount in smallest unit (paise/cents)
 * @param {string} currency - Currency code (default INR)
 * @param {boolean} fromSmallestUnit - Whether amount is in paise/cents
 * @returns {string}
 */
const formatCurrency = (amount, currency = 'INR', fromSmallestUnit = true) => {
  const value = fromSmallestUnit ? amount / 100 : amount;
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
};

/**
 * Get start and end dates for a given period
 * @param {'day'|'week'|'month'|'year'|'custom'} period
 * @param {Date} [referenceDate]
 * @param {Date} [customStart]
 * @param {Date} [customEnd]
 * @returns {{ startDate: Date, endDate: Date }}
 */
const getDateRange = (period, referenceDate = new Date(), customStart = null, customEnd = null) => {
  const ref = new Date(referenceDate);
  let startDate, endDate;

  switch (period) {
    case 'day':
      startDate = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate(), 0, 0, 0, 0);
      endDate = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate(), 23, 59, 59, 999);
      break;

    case 'week': {
      const dayOfWeek = ref.getDay(); // 0=Sun
      startDate = new Date(ref);
      startDate.setDate(ref.getDate() - dayOfWeek);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
    }

    case 'month':
      startDate = new Date(ref.getFullYear(), ref.getMonth(), 1, 0, 0, 0, 0);
      endDate = new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 23, 59, 59, 999);
      break;

    case 'year':
      startDate = new Date(ref.getFullYear(), 0, 1, 0, 0, 0, 0);
      endDate = new Date(ref.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;

    case 'custom':
      startDate = customStart ? new Date(customStart) : new Date(ref.getFullYear(), ref.getMonth(), 1);
      endDate = customEnd ? new Date(customEnd) : new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    default:
      startDate = new Date(ref.getFullYear(), ref.getMonth(), 1, 0, 0, 0, 0);
      endDate = new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  return { startDate, endDate };
};

/**
 * Parse a "YYYY-MM" string into start/end dates for that month
 * @param {string} monthYear - e.g. "2024-01"
 * @returns {{ startDate: Date, endDate: Date }}
 */
const parseMonthYear = (monthYear) => {
  const [year, month] = monthYear.split('-').map(Number);
  const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  return { startDate, endDate };
};

/**
 * Build pagination metadata and query options
 * @param {object} query - Express request query
 * @param {number} totalCount - Total matching documents
 * @returns {{ skip: number, limit: number, page: number, pagination: object }}
 */
const paginateQuery = (query, totalCount) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    skip,
    limit,
    page,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Convert amount to smallest unit (paise/cents)
 */
const toSmallestUnit = (amount) => Math.round(parseFloat(amount) * 100);

/**
 * Convert from smallest unit to main unit
 */
const fromSmallestUnit = (amount) => amount / 100;

/**
 * Generate a current monthYear string "YYYY-MM"
 */
const getCurrentMonthYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Build sort object from query string (e.g. "-date,amount")
 */
const buildSortObject = (sortStr, defaultSort = { createdAt: -1 }) => {
  if (!sortStr) return defaultSort;
  const sort = {};
  sortStr.split(',').forEach((field) => {
    if (field.startsWith('-')) {
      sort[field.slice(1)] = -1;
    } else {
      sort[field] = 1;
    }
  });
  return Object.keys(sort).length ? sort : defaultSort;
};

module.exports = {
  formatCurrency,
  getDateRange,
  parseMonthYear,
  paginateQuery,
  toSmallestUnit,
  fromSmallestUnit,
  getCurrentMonthYear,
  buildSortObject,
};
