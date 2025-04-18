import Transaction from '../models/Transaction.js';
import { 
  categorizeTransaction,
  normalizeAmount,
  parseDate 
} from '../utils/transactionCategories.js';
import { parse } from 'csv-parse';
import { Readable } from 'stream';

// @desc    Upload transactions from CSV
// @route   POST /api/transactions/upload
// @access  Private
export const uploadTransactions = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a CSV file'
      });
    }

    const file = req.files.file;
    const columnMapping = JSON.parse(req.body.columnMapping);

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a CSV file'
      });
    }

    const records = [];
    let hasError = false;

    // Create parser
    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    // Create promise to handle parsing
    const parsePromise = new Promise((resolve, reject) => {
      parser.on('readable', function() {
        let record;
        while ((record = parser.read()) !== null) {
          try {
            // Map columns based on user input
            const date = parseDate(record[columnMapping.date]);
            const amount = normalizeAmount(record[columnMapping.amount]);
            
            if (!date || amount === null) {
              continue; // Skip invalid records
            }

            const description = record[columnMapping.description]?.trim() || '';
            const category = categorizeTransaction(description);

            records.push({
              user: req.user.id,
              date,
              description,
              amount: Math.abs(amount), // Store absolute value
              isCredit: amount > 0, // Store sign as boolean
              category // Use auto-categorization
            });
          } catch (err) {
            console.error('Error processing record:', err);
            continue; // Skip problematic records
          }
        }
      });

      parser.on('error', (err) => {
        hasError = true;
        reject(err);
      });

      parser.on('end', () => {
        resolve();
      });
    });

    // Convert file buffer to stream and pipe to parser
    const stream = Readable.from(file.data.toString());
    stream.pipe(parser);

    // Wait for parsing to complete
    await parsePromise;

    if (hasError) {
      return res.status(400).json({
        success: false,
        message: 'Error parsing CSV file'
      });
    }

    if (records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid transactions found in file'
      });
    }

    // Insert transactions in bulk
    await Transaction.insertMany(records);

    res.status(200).json({
      success: true,
      count: records.length,
      message: `Successfully uploaded ${records.length} transactions`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing upload',
      error: error.message
    });
  }
};

// @desc    Get user transactions
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res, next) => {
  try {
    console.log(req.body);
    
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    const category = req.query.category;

    // Build query
    const query = { user: req.user.id };
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }
    if (category) {
      query.category = category;
    }

    // Execute query with pagination
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('date description amount isCredit category');

    // Transform amounts based on isCredit
    const transformedTransactions = transactions.map(t => ({
      ...t.toObject(),
      amount: t.isCredit ? t.amount : -t.amount
    }));

    // Get total count
    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      data: transformedTransactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transaction category
// @route   PUT /api/transactions/:id/category
// @access  Private
export const updateTransactionCategory = async (req, res, next) => {
  try {
    const { category } = req.body;

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { category },
      { new: true }
    ).select('date description amount isCredit category');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Transform amount based on isCredit
    const transformedTransaction = {
      ...transaction.toObject(),
      amount: transaction.isCredit ? transaction.amount : -transaction.amount
    };

    res.status(200).json({
      success: true,
      data: transformedTransaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};