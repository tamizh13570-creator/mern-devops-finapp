const Expense = require('../expenses/expense.model');
const Income = require('../income/income.model');
const { parseMonthYear, getCurrentMonthYear, fromSmallestUnit } = require('../../utils/helpers');
const PDFDocument = require('pdfkit');

class ReportService {
  async getMonthData(userId, monthYear = getCurrentMonthYear()) {
    const { startDate, endDate } = parseMonthYear(monthYear);

    const expenses = await Expense.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    })
      .populate('category', 'name icon')
      .sort({ date: -1 });

    const incomes = await Income.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: -1 });

    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

    return {
      monthYear,
      startDate,
      endDate,
      totalExpense: fromSmallestUnit(totalExpense),
      totalIncome: fromSmallestUnit(totalIncome),
      netSavings: fromSmallestUnit(totalIncome - totalExpense),
      expenseCount: expenses.length,
      incomeCount: incomes.length,
      expenses: expenses.map((e) => ({
        id: e._id,
        type: 'Expense',
        category: e.category?.name || 'Uncategorized',
        amount: fromSmallestUnit(e.amount),
        date: e.date.toISOString().split('T')[0],
        paymentMethod: e.paymentMethod,
        note: e.note || '',
        tags: e.tags.join(', '),
      })),
      incomes: incomes.map((i) => ({
        id: i._id,
        type: 'Income',
        source: i.source,
        amount: fromSmallestUnit(i.amount),
        date: i.date.toISOString().split('T')[0],
        paymentMethod: i.paymentMethod,
        note: i.note || '',
      })),
    };
  }

  generateCSV(data) {
    const rows = [];
    rows.push(['--- FINAPP FINANCIAL REPORT ---']);
    rows.push([`Month/Period: ${data.monthYear}`]);
    rows.push([`Total Income: INR ${data.totalIncome.toFixed(2)}`]);
    rows.push([`Total Expense: INR ${data.totalExpense.toFixed(2)}`]);
    rows.push([`Net Savings: INR ${data.netSavings.toFixed(2)}`]);
    rows.push([]);

    rows.push(['--- EXPENSES ---']);
    rows.push(['Date', 'Category', 'Amount (INR)', 'Payment Method', 'Note', 'Tags']);
    data.expenses.forEach((e) => {
      rows.push([
        `"${e.date}"`,
        `"${e.category}"`,
        e.amount.toFixed(2),
        `"${e.paymentMethod}"`,
        `"${(e.note || '').replace(/"/g, '""')}"`,
        `"${e.tags}"`,
      ]);
    });

    rows.push([]);
    rows.push(['--- INCOMES ---']);
    rows.push(['Date', 'Source', 'Amount (INR)', 'Payment Method', 'Note']);
    data.incomes.forEach((i) => {
      rows.push([
        `"${i.date}"`,
        `"${i.source}"`,
        i.amount.toFixed(2),
        `"${i.paymentMethod}"`,
        `"${(i.note || '').replace(/"/g, '""')}"`,
      ]);
    });

    return rows.map((r) => r.join(',')).join('\r\n');
  }

  generatePDF(data, res) {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    doc.pipe(res);

    // Header
    doc.fillColor('#1a1a2e').fontSize(22).text('FinApp - Financial Statement', { align: 'center' });
    doc.fontSize(12).fillColor('#666666').text(`Monthly Report: ${data.monthYear}`, { align: 'center' });
    doc.moveDown();

    // Summary Box
    doc.rect(40, doc.y, 515, 70).fillAndStroke('#f8f9fa', '#667eea');
    const boxY = doc.y + 12;

    doc.fillColor('#28a745').fontSize(12).text('Total Income', 60, boxY);
    doc.fontSize(16).text(`INR ${data.totalIncome.toLocaleString('en-IN')}`, 60, boxY + 18);

    doc.fillColor('#dc3545').fontSize(12).text('Total Expenses', 220, boxY);
    doc.fontSize(16).text(`INR ${data.totalExpense.toLocaleString('en-IN')}`, 220, boxY + 18);

    doc.fillColor('#667eea').fontSize(12).text('Net Savings', 380, boxY);
    doc.fontSize(16).text(`INR ${data.netSavings.toLocaleString('en-IN')}`, 380, boxY + 18);

    doc.y = boxY + 70;
    doc.moveDown();

    // Expenses Table
    doc.fillColor('#1a1a2e').fontSize(14).text(`Expenses (${data.expenseCount} entries)`);
    doc.fontSize(10).fillColor('#444444');

    // Table Header
    let startY = doc.y + 5;
    doc.rect(40, startY, 515, 20).fill('#e9ecef');
    doc.fillColor('#333333').font('Helvetica-Bold');
    doc.text('Date', 50, startY + 5);
    doc.text('Category', 130, startY + 5);
    doc.text('Method', 250, startY + 5);
    doc.text('Note', 330, startY + 5);
    doc.text('Amount (INR)', 470, startY + 5, { align: 'right', width: 75 });

    doc.font('Helvetica').fontSize(9);
    startY += 22;

    data.expenses.slice(0, 30).forEach((e, idx) => {
      if (startY > 740) {
        doc.addPage();
        startY = 50;
      }
      if (idx % 2 === 0) {
        doc.rect(40, startY - 2, 515, 18).fill('#fbfbfb');
      }
      doc.fillColor('#333333');
      doc.text(e.date, 50, startY);
      doc.text(e.category.slice(0, 18), 130, startY);
      doc.text(e.paymentMethod, 250, startY);
      doc.text((e.note || '-').slice(0, 22), 330, startY);
      doc.fillColor('#dc3545').text(e.amount.toFixed(2), 470, startY, { align: 'right', width: 75 });
      startY += 18;
    });

    // Incomes Section
    doc.y = startY + 15;
    if (doc.y > 700) {
      doc.addPage();
    }

    doc.moveDown();
    doc.fillColor('#1a1a2e').fontSize(14).text(`Income (${data.incomeCount} entries)`);

    startY = doc.y + 5;
    doc.rect(40, startY, 515, 20).fill('#e9ecef');
    doc.fillColor('#333333').font('Helvetica-Bold').fontSize(10);
    doc.text('Date', 50, startY + 5);
    doc.text('Source', 130, startY + 5);
    doc.text('Method', 250, startY + 5);
    doc.text('Note', 330, startY + 5);
    doc.text('Amount (INR)', 470, startY + 5, { align: 'right', width: 75 });

    doc.font('Helvetica').fontSize(9);
    startY += 22;

    data.incomes.slice(0, 20).forEach((i, idx) => {
      if (startY > 740) {
        doc.addPage();
        startY = 50;
      }
      if (idx % 2 === 0) {
        doc.rect(40, startY - 2, 515, 18).fill('#fbfbfb');
      }
      doc.fillColor('#333333');
      doc.text(i.date, 50, startY);
      doc.text(i.source, 130, startY);
      doc.text(i.paymentMethod, 250, startY);
      doc.text((i.note || '-').slice(0, 22), 330, startY);
      doc.fillColor('#28a745').text(i.amount.toFixed(2), 470, startY, { align: 'right', width: 75 });
      startY += 18;
    });

    // Footer
    doc.moveDown();
    doc.fontSize(8).fillColor('#999999').text('Generated by FinApp Financial Platform. Keep track of every rupee.', 40, 790, { align: 'center', width: 515 });

    doc.end();
  }
}

module.exports = new ReportService();
