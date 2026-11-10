export const formatCurrency = (amount, currency = 'INR') => {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 2,
    }).format(num);
  } catch (e) {
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  }
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const getCurrentMonthYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const getMonthName = (monthYear) => {
  if (!monthYear) return '';
  const [year, month] = monthYear.split('-');
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
};
