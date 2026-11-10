const reportService = require('./report.service');
const { getCurrentMonthYear } = require('../../utils/helpers');

exports.getMonthSummary = async (req, res, next) => {
  try {
    const monthYear = req.params.monthYear || req.query.monthYear || getCurrentMonthYear();
    const data = await reportService.getMonthData(req.user._id, monthYear);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.downloadCSV = async (req, res, next) => {
  try {
    const monthYear = req.params.monthYear || req.query.monthYear || getCurrentMonthYear();
    const data = await reportService.getMonthData(req.user._id, monthYear);
    const csvContent = reportService.generateCSV(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=finapp-report-${monthYear}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

exports.downloadPDF = async (req, res, next) => {
  try {
    const monthYear = req.params.monthYear || req.query.monthYear || getCurrentMonthYear();
    const data = await reportService.getMonthData(req.user._id, monthYear);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=finapp-statement-${monthYear}.pdf`);
    reportService.generatePDF(data, res);
  } catch (error) {
    next(error);
  }
};

exports.downloadJSON = async (req, res, next) => {
  try {
    const monthYear = req.params.monthYear || req.query.monthYear || getCurrentMonthYear();
    const data = await reportService.getMonthData(req.user._id, monthYear);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=finapp-data-${monthYear}.json`);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
