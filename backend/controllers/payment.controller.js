import Payment from "../models/Payment.js";
import { cloudinary } from "../config/cloudinary.js";
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

// Create new payment
export const createPayment = async (req, res) => {
  try {
    const { date, description, bankAccount, amount, status, remarks, user } = req.body;

    // Validate required fields
    if (!date || !description || !bankAccount || !amount || !user) {
      return res.status(400).json({
        success: false,
        message: "Date, description, bank account, amount, and user are required",
      });
    }

    // Prepare payment data
    const paymentData = {
      date,
      description,
      bankAccount,
      user,
      amount,
      status: status || "Un Posted",
      remarks: remarks || "",
    };

    // Add receipt if uploaded
    if (req.file) {
      paymentData.receipt = req.file.path;
      paymentData.receiptPublicId = req.file.filename;
    }

    // Create new payment
    const newPayment = await Payment.create(paymentData);
    
    // Populate bank account and user details
    await newPayment.populate(["bankAccount", "user"]);

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: newPayment,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({
      success: false,
      message: "Error creating payment",
      error: error.message,
    });
  }
};

// Get all payments with filters
export const getPayments = async (req, res) => {
  try {
    const { dateFrom, dateTo, status } = req.query;

    // Build filter query
    let filter = {};

    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    if (status && status !== "All") {
      filter.status = status;
    }

    // Fetch payments with populated bank account and user
    const payments = await Payment.find(filter)
      .populate("bankAccount")
      .populate("user", "name email companyName")
      .populate("editedBy", "name email")
      .sort({ date: -1 });

    // Calculate total amount
    const total = payments.reduce((sum, payment) => sum + payment.amount, 0);

    res.status(200).json({
      success: true,
      data: payments,
      total,
      count: payments.length,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payments",
      error: error.message,
    });
  }
};

// Get single payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id)
      .populate("bankAccount")
      .populate("user", "name email companyName");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment",
      error: error.message,
    });
  }
};

// Update payment
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, description, bankAccount, amount, status, remarks, editedBy } = req.body;

    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Update fields
    if (date) payment.date = date;
    if (description) payment.description = description;
    if (bankAccount) payment.bankAccount = bankAccount;
    if (amount) payment.amount = amount;
    if (status) {
      payment.status = status;
      // Track who changed the status and when
      if (editedBy) {
        payment.editedBy = editedBy;
        payment.editedAt = new Date();
      }
    }
    if (remarks !== undefined) payment.remarks = remarks;

    // Update receipt if new file uploaded
    if (req.file) {
      // Delete old receipt from Cloudinary
      if (payment.receiptPublicId) {
        await cloudinary.uploader.destroy(payment.receiptPublicId);
      }
      payment.receipt = req.file.path;
      payment.receiptPublicId = req.file.filename;
    }

    await payment.save();
    await payment.populate("bankAccount");

    res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(500).json({
      success: false,
      message: "Error updating payment",
      error: error.message,
    });
  }
};

// Delete payment
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Delete receipt from Cloudinary if exists
    if (payment.receiptPublicId) {
      await cloudinary.uploader.destroy(payment.receiptPublicId);
    }

    await Payment.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting payment:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting payment",
      error: error.message,
    });
  }
};

// Get ledger for a specific user
export const getLedgerByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { dateFrom, dateTo } = req.query;

    // Build filter query
    let filter = { user: userId };

    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    // Fetch payments for the user
    const payments = await Payment.find(filter)
      .populate("bankAccount", "bankName accountNumber")
      .sort({ date: 1 });

    // Format ledger entries
    const ledgerEntries = payments.map(payment => ({
      voucherId: payment._id,
      date: payment.date,
      description: payment.description,
      debit: payment.status === "Posted" ? payment.amount : 0,
      credit: payment.status === "Un Posted" ? 0 : 0, // Adjust based on your business logic
    }));

    res.status(200).json({
      success: true,
      data: ledgerEntries,
    });
  } catch (error) {
    console.error("Error fetching ledger:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching ledger",
      error: error.message,
    });
  }
};

// Export ledger as CSV
export const exportLedgerCSV = async (req, res) => {
  try {
    const { userId } = req.params;
    const { dateFrom, dateTo, userName } = req.query;

    let filter = { user: userId };
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const payments = await Payment.find(filter)
      .populate("bankAccount", "bankName accountNumber")
      .sort({ date: 1 });

    const ledgerEntries = payments.map(payment => ({
      voucherId: payment._id,
      date: payment.date,
      description: payment.description,
      debit: payment.status === "Posted" ? payment.amount : 0,
      credit: payment.status === "Un Posted" ? 0 : 0,
    }));

    // Calculate totals
    const totalDebit = ledgerEntries.reduce((sum, entry) => sum + entry.debit, 0);
    const totalCredit = ledgerEntries.reduce((sum, entry) => sum + entry.credit, 0);
    const closingBalance = totalDebit - totalCredit;

    // Generate CSV content
    let csvContent = `Ledger of ${userName || 'User'}\n`;
    csvContent += `From ${dateFrom} To ${dateTo}\n\n`;
    csvContent += "Voucher Id,Date,Description,Debit,Credit\n";
    
    ledgerEntries.forEach(entry => {
      const formattedDate = new Date(entry.date).toLocaleDateString();
      csvContent += `${entry.voucherId},${formattedDate},"${entry.description}",${entry.debit},${entry.credit}\n`;
    });
    
    csvContent += `\nTotal,,,${totalDebit.toFixed(2)},${totalCredit.toFixed(2)}\n`;
    csvContent += `\nClosing Balance,,,${closingBalance.toFixed(2)}\n`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="ledger-${userId}-${Date.now()}.csv"`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Type');
    res.send(csvContent);
  } catch (error) {
    console.error("Error exporting CSV:", error);
    res.status(500).json({
      success: false,
      message: "Error exporting CSV",
      error: error.message,
    });
  }
};

// Export ledger as Excel
export const exportLedgerExcel = async (req, res) => {
  try {
    const { userId } = req.params;
    const { dateFrom, dateTo, userName } = req.query;

    console.log('Excel Export Request:', { userId, dateFrom, dateTo, userName });

    let filter = { user: userId };
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const payments = await Payment.find(filter)
      .populate("bankAccount", "bankName accountNumber")
      .sort({ date: 1 });

    const ledgerEntries = payments.map(payment => ({
      voucherId: payment._id.toString(),
      date: payment.date,
      description: payment.description,
      debit: payment.status === "Posted" ? payment.amount : 0,
      credit: payment.status === "Un Posted" ? 0 : 0,
    }));

    const totalDebit = ledgerEntries.reduce((sum, entry) => sum + entry.debit, 0);
    const totalCredit = ledgerEntries.reduce((sum, entry) => sum + entry.credit, 0);
    const closingBalance = totalDebit - totalCredit;

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Ledger');

    // Add title
    worksheet.mergeCells('A1:E1');
    worksheet.getCell('A1').value = `Ledger of ${userName || 'User'}`;
    worksheet.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FFFF0000' } };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    // Add date range
    worksheet.mergeCells('A2:E2');
    worksheet.getCell('A2').value = `From ${dateFrom} To ${dateTo}`;
    worksheet.getCell('A2').font = { bold: true, color: { argb: 'FF008000' } };
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    // Add headers
    worksheet.addRow([]);
    const headerRow = worksheet.addRow(['Voucher Id', 'Date', 'Description', 'Debit', 'Credit']);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF333333' },
    };
    headerRow.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center' };
    });

    // Add data rows
    ledgerEntries.forEach(entry => {
      worksheet.addRow([
        entry.voucherId,
        new Date(entry.date).toLocaleDateString(),
        entry.description,
        entry.debit > 0 ? entry.debit.toFixed(2) : '',
        entry.credit > 0 ? entry.credit.toFixed(2) : '',
      ]);
    });

    // Add total row
    const totalRow = worksheet.addRow(['', '', 'Total', totalDebit.toFixed(2), totalCredit.toFixed(2)]);
    totalRow.font = { bold: true };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Add closing balance
    worksheet.addRow([]);
    const balanceRow = worksheet.addRow(['', '', 'Closing Balance', closingBalance.toFixed(2), '']);
    balanceRow.font = { bold: true };

    // Set column widths
    worksheet.columns = [
      { width: 25 },
      { width: 15 },
      { width: 40 },
      { width: 15 },
      { width: 15 },
    ];

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="ledger-${userId}-${Date.now()}.xlsx"`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Type');
    res.send(buffer);
  } catch (error) {
    console.error("Error exporting Excel:", error);
    res.status(500).json({
      success: false,
      message: "Error exporting Excel",
      error: error.message,
    });
  }
};

// Export ledger as PDF
export const exportLedgerPDF = async (req, res) => {
  try {
    const { userId } = req.params;
    const { dateFrom, dateTo, userName } = req.query;

    console.log('PDF Export Request:', { userId, dateFrom, dateTo, userName });

    let filter = { user: userId };
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const payments = await Payment.find(filter)
      .populate("bankAccount", "bankName accountNumber")
      .sort({ date: 1 });

    console.log('Found payments:', payments.length);

    const ledgerEntries = payments.map(payment => ({
      voucherId: payment._id.toString(),
      date: payment.date,
      description: payment.description,
      debit: payment.status === "Posted" ? payment.amount : 0,
      credit: payment.status === "Un Posted" ? 0 : 0,
    }));

    const totalDebit = ledgerEntries.reduce((sum, entry) => sum + entry.debit, 0);
    const totalCredit = ledgerEntries.reduce((sum, entry) => sum + entry.credit, 0);
    const closingBalance = totalDebit - totalCredit;

    // Create PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set response headers with CORS support
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ledger-${userId}-${Date.now()}.pdf"`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Type');

    // Pipe PDF to response
    doc.pipe(res);

    // Add title
    doc.fontSize(20).fillColor('red').text(`Ledger of ${(userName || 'User').toUpperCase()}`, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('green').text(`From ${dateFrom} To ${dateTo}`, { align: 'center' });
    doc.moveDown(2);

    // Table headers
    const tableTop = doc.y;
    const col1X = 50;
    const col2X = 150;
    const col3X = 250;
    const col4X = 420;
    const col5X = 500;

    doc.fontSize(10).fillColor('black').font('Helvetica-Bold');
    doc.text('Voucher Id', col1X, tableTop, { width: 90 });
    doc.text('Date', col2X, tableTop, { width: 90 });
    doc.text('Description', col3X, tableTop, { width: 160 });
    doc.text('Debit', col4X, tableTop, { width: 70, align: 'right' });
    doc.text('Credit', col5X, tableTop, { width: 70, align: 'right' });

    doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
    doc.moveDown();

    // Table rows
    ledgerEntries.forEach(entry => {
      const y = doc.y;
      doc.fontSize(9).font('Helvetica');
      doc.text(entry.voucherId.substring(0, 10), col1X, y, { width: 90 });
      doc.text(new Date(entry.date).toLocaleDateString(), col2X, y, { width: 90 });
      doc.text(entry.description.substring(0, 50), col3X, y, { width: 160 });
      doc.text(entry.debit > 0 ? entry.debit.toFixed(2) : '', col4X, y, { width: 70, align: 'right' });
      doc.text(entry.credit > 0 ? entry.credit.toFixed(2) : '', col5X, y, { width: 70, align: 'right' });
      doc.moveDown(0.8);

      // Add new page if needed
      if (doc.y > 700) {
        doc.addPage();
      }
    });

    // Total row
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    const totalY = doc.y;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Total:', col3X, totalY, { width: 160, align: 'right' });
    doc.text(totalDebit.toFixed(2), col4X, totalY, { width: 70, align: 'right' });
    doc.text(totalCredit.toFixed(2), col5X, totalY, { width: 70, align: 'right' });

    // Closing balance
    doc.moveDown(2);
    doc.fontSize(12).font('Helvetica-Bold');
    const balanceY = doc.y;
    doc.fillColor('black').text('Closing Balance:', col3X, balanceY, { width: 160, align: 'right' });
    doc.fillColor(closingBalance >= 0 ? 'green' : 'red')
       .text(closingBalance.toFixed(2), col4X, balanceY, { width: 150, align: 'left' });

    doc.end();
  } catch (error) {
    console.error("Error exporting PDF:", error);
    console.error("Error stack:", error.stack);
    
    // If headers haven't been sent yet, send error response
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error exporting PDF",
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
};
