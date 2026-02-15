const { getDatabase } = require('@/lib/db');

/**
 * GET /api/sales
 * Returns all sales from the database
 */
export async function GET() {
  try {
    let db;
    try {
      db = getDatabase();
    } catch (dbError) {
      console.error('Error getting database connection:', dbError);
      return Response.json(
        { error: 'Database connection error', message: dbError.message },
        { status: 500 }
      );
    }

    return new Promise((resolve, reject) => {
      // Check if table exists first
      db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='sales'", [], (tableErr, tables) => {
        if (tableErr) {
          console.error('Error checking for sales table:', tableErr.message);
          reject(
            Response.json(
              { error: 'Database error', message: tableErr.message },
              { status: 500 }
            )
          );
          return;
        }
        
        if (!tables || tables.length === 0) {
          // Table doesn't exist, return empty array
          console.log('Sales table does not exist yet, returning empty array');
          resolve(Response.json({ success: true, data: [] }, { status: 200 }));
          return;
        }
        
        // Table exists, fetch sales
        db.all('SELECT * FROM sales ORDER BY created_at DESC', [], (err, rows) => {
          if (err) {
            console.error('Error fetching sales:', err.message);
            // If table doesn't exist error, return empty array
            if (err.message.includes('no such table')) {
              console.log('Sales table does not exist, returning empty array');
              resolve(Response.json({ success: true, data: [] }, { status: 200 }));
            } else {
              reject(
                Response.json(
                  { error: 'Failed to fetch sales', message: err.message },
                  { status: 500 }
                )
              );
            }
          } else {
            const sortedRows = (rows || []).sort((a, b) => {
              const dateA = a.saleDate || a.date || a.created_at || '';
              const dateB = b.saleDate || b.date || b.created_at || '';
              return dateB.localeCompare(dateA);
            });
            console.log(`Fetched ${sortedRows.length} sales`);
            resolve(Response.json({ success: true, data: sortedRows }, { status: 200 }));
          }
        });
      });
    });
  } catch (error) {
    console.error('Error in GET /api/sales:', error);
    return Response.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sales
 * Creates a new sale
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      saleInvoiceNo,
      shopName,
      ownerName,
      phone,
      address,
      saleMode,
      vehicleNo,
      salePayment,
      notes,
      birdType,
      numberOfCages,
      numberOfBirds,
      ratePerKg,
      averageWeight,
      totalWeight,
      totalAmount,
      transportCharges,
      loadingCharges,
      commission,
      otherCharges,
      deductions,
      totalInvoice,
      advancePaid,
      creditBalance,
      totalPaymentMade,
      outstandingPayment,
      paymentMode,
      balanceAmount,
      saleDate,
      // Legacy fields
      customer,
      date,
      quantity,
      unitPrice,
      paymentStatus,
    } = body;

    let db;
    try {
      db = getDatabase();
    } catch (dbError) {
      console.error('Error getting database connection:', dbError);
      return Response.json(
        { error: 'Database connection error', message: dbError.message },
        { status: 500 }
      );
    }

    return new Promise((resolve, reject) => {
      // Ensure all columns exist
      const ensureColumns = () => {
        return new Promise((resolveCols) => {
          const columnsToAdd = [
            'saleInvoiceNo TEXT', 'shopName TEXT', 'ownerName TEXT', 'phone TEXT', 'address TEXT',
            'saleMode TEXT', 'vehicleNo TEXT', 'salePayment TEXT', 'notes TEXT', 'birdType TEXT',
            'numberOfCages INTEGER', 'numberOfBirds INTEGER', 'averageWeight REAL',
            'totalWeight REAL', 'ratePerKg REAL', 'totalAmount REAL',
            'transportCharges REAL', 'loadingCharges REAL', 'commission REAL',
            'otherCharges REAL', 'deductions REAL', 'totalInvoice REAL',
            'advancePaid REAL', 'creditBalance REAL', 'totalPaymentMade REAL',
            'outstandingPayment REAL', 'paymentMode TEXT', 'balanceAmount REAL',
            'saleDate TEXT'
          ];
          
          let completed = 0;
          const total = columnsToAdd.length;
          
          if (total === 0) {
            resolveCols();
            return;
          }
          
          columnsToAdd.forEach((colDef) => {
            const colName = colDef.split(' ')[0];
            db.run(`ALTER TABLE sales ADD COLUMN ${colDef}`, (alterErr) => {
              if (alterErr && !alterErr.message.includes('duplicate column name')) {
                console.warn(`Warning adding column ${colName}:`, alterErr.message);
              }
              completed++;
              if (completed === total) {
                resolveCols();
              }
            });
          });
        });
      };

      ensureColumns().then(() => {
        const finalDate = saleDate || date || new Date().toISOString().split('T')[0];
        
        // Parse numeric values, handling empty strings
        const parseNumber = (val) => {
          if (val === '' || val === null || val === undefined) return 0;
          const parsed = parseFloat(val);
          return isNaN(parsed) ? 0 : parsed;
        };
        
        const parseInteger = (val) => {
          if (val === '' || val === null || val === undefined) return 0;
          const parsed = parseInt(val);
          return isNaN(parsed) ? 0 : parsed;
        };
        
        const numCages = parseInteger(numberOfCages);
        const numBirds = parseInteger(numberOfBirds) || (numCages * 16);
        
        console.log('Inserting sale with data:', {
          saleInvoiceNo,
          shopName: shopName || customer,
          numberOfCages: numCages,
          numberOfBirds: numBirds,
          ratePerKg: parseNumber(ratePerKg),
        });
        
        db.run(
          `INSERT INTO sales (
            saleInvoiceNo, shopName, ownerName, phone, address, saleMode, vehicleNo, salePayment, notes,
            birdType, numberOfCages, numberOfBirds, averageWeight, totalWeight,
            ratePerKg, totalAmount, transportCharges, loadingCharges, commission,
            otherCharges, deductions, totalInvoice, advancePaid, creditBalance,
            totalPaymentMade, outstandingPayment, paymentMode, balanceAmount, saleDate,
            created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [
            saleInvoiceNo || '',
            shopName || customer || '',
            ownerName || '',
            phone || '',
            address || '',
            saleMode || '',
            vehicleNo || '',
            salePayment || paymentStatus || 'Paid',
            notes || '',
            birdType || '',
            numCages,
            numBirds,
            parseNumber(averageWeight),
            parseNumber(totalWeight),
            parseNumber(ratePerKg) || parseNumber(unitPrice),
            parseNumber(totalAmount),
            parseNumber(transportCharges),
            parseNumber(loadingCharges),
            parseNumber(commission),
            parseNumber(otherCharges),
            parseNumber(deductions),
            parseNumber(totalInvoice),
            parseNumber(advancePaid),
            parseNumber(creditBalance),
            parseNumber(totalPaymentMade),
            parseNumber(outstandingPayment),
            (paymentMode && paymentMode.trim() !== '' && ['Cash', 'Credit', 'Online'].includes(paymentMode)) ? paymentMode : null,
            parseNumber(balanceAmount),
            finalDate,
          ],
          function(err) {
            if (err) {
              console.error('Error inserting sale:', err.message);
              console.error('Error details:', err);
              const errorResponse = Response.json(
                { error: 'Failed to create sale', message: err.message, details: err.toString() },
                { status: 500 }
              );
              resolve(errorResponse);
            } else {
              console.log('Sale inserted successfully with ID:', this.lastID);
              db.get('SELECT * FROM sales WHERE id = ?', [this.lastID], (err, row) => {
                if (err) {
                  console.error('Error fetching created sale:', err.message);
                  const createdSale = {
                    id: this.lastID,
                    saleInvoiceNo: saleInvoiceNo || '',
                    shopName: shopName || customer || '',
                    ownerName: ownerName || '',
                    phone: phone || '',
                    address: address || '',
                    saleMode: saleMode || '',
                    vehicleNo: vehicleNo || '',
                    salePayment: salePayment || paymentStatus || 'Paid',
                    notes: notes || '',
                    birdType: birdType || '',
                    numberOfCages: numCages,
                    numberOfBirds: numBirds,
                    ratePerKg: parseNumber(ratePerKg) || parseNumber(unitPrice),
                    averageWeight: parseNumber(averageWeight),
                    totalWeight: parseNumber(totalWeight),
                    totalAmount: parseNumber(totalAmount),
                    transportCharges: parseNumber(transportCharges),
                    loadingCharges: parseNumber(loadingCharges),
                    commission: parseNumber(commission),
                    otherCharges: parseNumber(otherCharges),
                    deductions: parseNumber(deductions),
                    totalInvoice: parseNumber(totalInvoice),
                    advancePaid: parseNumber(advancePaid),
                    creditBalance: parseNumber(creditBalance),
                    totalPaymentMade: parseNumber(totalPaymentMade),
                    outstandingPayment: parseNumber(outstandingPayment),
                    paymentMode: paymentMode || '',
                    balanceAmount: parseNumber(balanceAmount),
                    saleDate: finalDate,
                  };
                  resolve(Response.json({ success: true, data: createdSale }, { status: 201 }));
                } else {
                  console.log('Sale fetched successfully:', row);
                  resolve(Response.json({ success: true, data: row }, { status: 201 }));
                }
              });
            }
          }
        );
      }).catch((colErr) => {
        console.warn('Error ensuring columns exist:', colErr.message);
        const errorResponse = Response.json(
          { error: 'Database schema error', message: colErr.message },
          { status: 500 }
        );
        resolve(errorResponse);
      });
    });
  } catch (error) {
    console.error('Error in POST /api/sales:', error);
    return Response.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sales
 * Deletes a sale by ID
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json(
        { error: 'Validation error', message: 'Sale ID is required' },
        { status: 400 }
      );
    }

    let db;
    try {
      db = getDatabase();
    } catch (dbError) {
      console.error('Error getting database connection:', dbError);
      return Response.json(
        { error: 'Database connection error', message: dbError.message },
        { status: 500 }
      );
    }

    return new Promise((resolve, reject) => {
      db.run('DELETE FROM sales WHERE id = ?', [id], function(err) {
        if (err) {
          console.error('Error deleting sale:', err.message);
          reject(
            Response.json(
              { error: 'Failed to delete sale', message: err.message },
              { status: 500 }
            )
          );
        } else {
          if (this.changes === 0) {
            resolve(
              Response.json(
                { error: 'Not found', message: 'Sale not found' },
                { status: 404 }
              )
            );
          } else {
            resolve(
              Response.json(
                { success: true, message: 'Sale deleted successfully' },
                { status: 200 }
              )
            );
          }
        }
      });
    });
  } catch (error) {
    console.error('Error in DELETE /api/sales:', error);
    return Response.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

