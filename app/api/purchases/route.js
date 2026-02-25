const { getDatabase } = require('@/lib/db');

/**
 * GET /api/purchases
 * Returns all purchase orders from the database
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
      // Try to get all purchases, ordering by available date fields
      db.all('SELECT * FROM purchases ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
          console.error('Error fetching purchases:', err.message);
          console.error('Full error:', err);
          reject(
            Response.json(
              { error: 'Failed to fetch purchases', message: err.message, details: err.toString() },
              { status: 500 }
            )
          );
        } else {
          // Sort rows in memory if purchaseDate or date columns exist
          const sortedRows = (rows || []).sort((a, b) => {
            const dateA = a.purchaseDate || a.date || a.created_at || '';
            const dateB = b.purchaseDate || b.date || b.created_at || '';
            return dateB.localeCompare(dateA);
          });
          resolve(Response.json({ success: true, data: sortedRows }, { status: 200 }));
        }
      });
    });
  } catch (error) {
    console.error('Error in GET /api/purchases:', error);
    console.error('Full error stack:', error.stack);
    return Response.json(
      { error: 'Internal server error', message: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}

/**
 * POST /api/purchases
 * Creates a new purchase order
 * Body: { purchaseInvoiceNo, purchaseDate, farmerName, ... }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      purchaseInvoiceNo,
      purchaseDate,
      farmerName,
      farmerMobile,
      farmLocation,
      vehicleNo,
      purchaseType,
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
      outstandingPayment,
      paymentMode,
      totalPaymentMade,
      balanceAmount,
      dueDate,
      cageDetails,
      // Legacy fields for backward compatibility
      supplier,
      date,
      description,
      birdQuantity,
      cageQuantity,
      unitCost,
      status,
    } = body;

    // Validate required fields (new structure)
    if (!purchaseInvoiceNo || !purchaseDate || !farmerName || numberOfCages === undefined || numberOfBirds === undefined || ratePerKg === undefined) {
      // Try legacy fields for backward compatibility
      if (!supplier || !date || !description || birdQuantity === undefined || unitCost === undefined) {
        return Response.json(
          { error: 'Validation error', message: 'Missing required fields' },
          { status: 400 }
        );
      }
    }
    
    // Generate order number
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
      // Get count of existing orders to generate order number
      db.get('SELECT COUNT(*) as count FROM purchases', [], (err, row) => {
        if (err) {
          console.error('Error counting purchases:', err.message);
          reject(
            Response.json(
              { error: 'Failed to create purchase order', message: err.message },
              { status: 500 }
            )
          );
          return;
        }

        const orderNumber = purchaseInvoiceNo || `PO-${String((row.count || 0) + 1).padStart(3, '0')}`;

        // Use new fields if available, otherwise fall back to legacy fields
        const finalSupplier = farmerName || supplier || '';
        const finalDate = purchaseDate || date || '';
        const finalDescription = description || `${birdType || ''} - ${numberOfBirds || birdQuantity || 0} birds`.trim();
        const finalBirdQuantity = parseInt(numberOfBirds || birdQuantity) || 0;
        const finalCageQuantity = parseInt(numberOfCages || cageQuantity) || 0;
        const finalUnitCost = parseFloat(ratePerKg || unitCost) || 0;
        const finalTotalValue = parseFloat(totalAmount || (finalBirdQuantity * finalUnitCost)) || 0;
        const finalStatus = status || 'pending';

        // Helper function to insert with legacy schema
        const insertLegacy = () => {
          db.run(
            `INSERT INTO purchases (orderNumber, supplier, date, description, birdQuantity, cageQuantity, unitCost, totalValue, status, notes) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              orderNumber,
              finalSupplier.trim(),
              finalDate,
              finalDescription.trim(),
              finalBirdQuantity,
              finalCageQuantity,
              finalUnitCost,
              finalTotalValue,
              finalStatus,
              notes?.trim() || null,
            ],
            function(err) {
              if (err) {
                console.error('Error creating purchase order (legacy):', err.message);
                reject(
                  Response.json(
                    { error: 'Failed to create purchase order', message: err.message },
                    { status: 500 }
                  )
                );
              } else {
                // Return with new field structure
                const createdOrder = {
                  id: this.lastID,
                  purchaseInvoiceNo: purchaseInvoiceNo || orderNumber,
                  purchaseDate: purchaseDate || finalDate,
                  farmerName: farmerName || finalSupplier,
                  farmerMobile: farmerMobile || '',
                  farmLocation: farmLocation || '',
                  vehicleNo: vehicleNo || '',
                  purchaseType: purchaseType || 'Paid',
                  notes: notes || '',
                  birdType: birdType || '',
                  numberOfCages: numberOfCages || finalCageQuantity,
                  numberOfBirds: numberOfBirds || finalBirdQuantity,
                  ratePerKg: ratePerKg || finalUnitCost,
                  averageWeight: averageWeight || 0,
                  totalWeight: totalWeight || 0,
                  totalAmount: totalAmount || finalTotalValue,
                  transportCharges: transportCharges || 0,
                  loadingCharges: loadingCharges || 0,
                  commission: commission || 0,
                  otherCharges: otherCharges || 0,
                  deductions: deductions || 0,
                  totalInvoice: totalInvoice || 0,
                  advancePaid: advancePaid || 0,
                  outstandingPayment: outstandingPayment || 0,
                  paymentMode: paymentMode || '',
                  totalPaymentMade: totalPaymentMade || 0,
                  balanceAmount: balanceAmount || 0,
                  dueDate: dueDate || '',
                  // Legacy fields for compatibility
                  orderNumber: orderNumber,
                  supplier: finalSupplier,
                  date: finalDate,
                  description: finalDescription,
                  birdQuantity: finalBirdQuantity,
                  cageQuantity: finalCageQuantity,
                  unitCost: finalUnitCost,
                  totalValue: finalTotalValue,
                  status: finalStatus,
                };
                resolve(
                  Response.json(
                    {
                      success: true,
                      message: 'Purchase order created successfully',
                      data: createdOrder,
                    },
                    { status: 201 }
                  )
                );
              }
            }
          );
        };

        // First, ensure all columns exist by running ALTER TABLE statements
        const ensureColumns = () => {
          return new Promise((resolveCols, rejectCols) => {
            const columnsToAdd = [
              'purchaseInvoiceNo TEXT', 'purchaseDate TEXT', 'farmerName TEXT', 'farmerMobile TEXT',
              'farmLocation TEXT', 'vehicleNo TEXT', 'purchaseType TEXT', 'birdType TEXT',
              'numberOfCages INTEGER', 'numberOfBirds INTEGER', 'averageWeight REAL', 'totalWeight REAL',
              'ratePerKg REAL', 'totalAmount REAL', 'transportCharges REAL', 'loadingCharges REAL',
              'commission REAL', 'otherCharges REAL', 'deductions REAL', 'totalInvoice REAL',
              'advancePaid REAL', 'outstandingPayment REAL', 'paymentMode TEXT', 'totalPaymentMade REAL',
              'balanceAmount REAL', 'dueDate TEXT', 'cageDetails TEXT'
            ];
            
            let completed = 0;
            const total = columnsToAdd.length;
            
            if (total === 0) {
              resolveCols();
              return;
            }
            
            columnsToAdd.forEach((colDef) => {
              const colName = colDef.split(' ')[0];
              db.run(`ALTER TABLE purchases ADD COLUMN ${colDef}`, (alterErr) => {
                // Ignore "duplicate column" errors
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
        
        // Try to insert with new schema first, fallback to legacy if needed
        ensureColumns().then(() => {
          // Try new schema insert
          const cageDetailsJson = Array.isArray(cageDetails) ? JSON.stringify(cageDetails) : (cageDetails || null);
          db.run(
            `INSERT INTO purchases (
              purchaseInvoiceNo, purchaseDate, farmerName, farmerMobile, farmLocation, vehicleNo,
              purchaseType, notes, birdType, numberOfCages, numberOfBirds, averageWeight,
              totalWeight, ratePerKg, totalAmount, transportCharges, loadingCharges,
              commission, otherCharges, deductions, totalInvoice, advancePaid,
              outstandingPayment, paymentMode, totalPaymentMade, balanceAmount, dueDate,
              cageDetails,
              orderNumber, supplier, date, description, birdQuantity, cageQuantity, unitCost, totalValue, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              purchaseInvoiceNo || orderNumber,
              purchaseDate || finalDate,
              farmerName || finalSupplier.trim(),
              farmerMobile || null,
              farmLocation || null,
              vehicleNo || null,
              purchaseType || 'Paid',
              notes?.trim() || null,
              birdType || null,
              parseInt(numberOfCages) || finalCageQuantity,
              parseInt(numberOfBirds) || finalBirdQuantity,
              parseFloat(averageWeight) || null,
              parseFloat(totalWeight) || null,
              parseFloat(ratePerKg) || finalUnitCost,
              parseFloat(totalAmount) || finalTotalValue,
              parseFloat(transportCharges) || null,
              parseFloat(loadingCharges) || null,
              parseFloat(commission) || null,
              parseFloat(otherCharges) || null,
              parseFloat(deductions) || null,
              parseFloat(totalInvoice) || null,
              parseFloat(advancePaid) || null,
              parseFloat(outstandingPayment) || null,
              paymentMode || null,
              parseFloat(totalPaymentMade) || null,
              parseFloat(balanceAmount) || null,
              dueDate || null,
              cageDetailsJson,
              // Legacy fields
              orderNumber,
              finalSupplier.trim(),
              finalDate,
              finalDescription.trim(),
              finalBirdQuantity,
              finalCageQuantity,
              finalUnitCost,
              finalTotalValue,
              finalStatus,
            ],
            function(err) {
              if (err) {
                console.warn('New schema insert failed, trying legacy:', err.message);
                insertLegacy();
              } else {
                // Fetch the created order
                db.get('SELECT * FROM purchases WHERE id = ?', [this.lastID], (err, row) => {
                  if (err) {
                    console.error('Error fetching created purchase:', err.message);
                    // Return with new field structure
                    const createdOrder = {
                      id: this.lastID,
                      purchaseInvoiceNo: purchaseInvoiceNo || orderNumber,
                      purchaseDate: purchaseDate || finalDate,
                      farmerName: farmerName || finalSupplier,
                      farmerMobile: farmerMobile || '',
                      farmLocation: farmLocation || '',
                      vehicleNo: vehicleNo || '',
                      purchaseType: purchaseType || 'Paid',
                      notes: notes || '',
                      birdType: birdType || '',
                      numberOfCages: numberOfCages || finalCageQuantity,
                      numberOfBirds: numberOfBirds || finalBirdQuantity,
                      ratePerKg: ratePerKg || finalUnitCost,
                      averageWeight: averageWeight || 0,
                      totalWeight: totalWeight || 0,
                      totalAmount: totalAmount || finalTotalValue,
                      transportCharges: transportCharges || 0,
                      loadingCharges: loadingCharges || 0,
                      commission: commission || 0,
                      otherCharges: otherCharges || 0,
                      deductions: deductions || 0,
                      totalInvoice: totalInvoice || 0,
                      advancePaid: advancePaid || 0,
                      outstandingPayment: outstandingPayment || 0,
                      paymentMode: paymentMode || '',
                      totalPaymentMade: totalPaymentMade || 0,
                      balanceAmount: balanceAmount || 0,
                      dueDate: dueDate || '',
                      // Legacy fields for compatibility
                      orderNumber: orderNumber,
                      supplier: finalSupplier,
                      date: finalDate,
                      description: finalDescription,
                      birdQuantity: finalBirdQuantity,
                      cageQuantity: finalCageQuantity,
                      unitCost: finalUnitCost,
                      totalValue: finalTotalValue,
                      status: finalStatus,
                    };
                    resolve(
                      Response.json(
                        {
                          success: true,
                          message: 'Purchase order created successfully',
                          data: createdOrder,
                        },
                        { status: 201 }
                      )
                    );
                  } else {
                    // Return with new field structure
                    const createdOrder = {
                      ...row,
                      purchaseInvoiceNo: purchaseInvoiceNo || row.orderNumber || row.purchaseInvoiceNo,
                      purchaseDate: purchaseDate || row.date || row.purchaseDate,
                      farmerName: farmerName || row.supplier || row.farmerName,
                      farmerMobile: farmerMobile || row.farmerMobile || '',
                      farmLocation: farmLocation || row.farmLocation || '',
                      vehicleNo: vehicleNo || row.vehicleNo || '',
                      purchaseType: purchaseType || row.purchaseType || 'Paid',
                      birdType: birdType || row.birdType || '',
                      numberOfCages: numberOfCages || row.cageQuantity || row.numberOfCages || 0,
                      numberOfBirds: numberOfBirds || row.birdQuantity || row.numberOfBirds || 0,
                      ratePerKg: ratePerKg || row.unitCost || row.ratePerKg || 0,
                      averageWeight: averageWeight || row.averageWeight || 0,
                      totalWeight: totalWeight || row.totalWeight || 0,
                      totalAmount: totalAmount || row.totalValue || row.totalAmount || 0,
                      transportCharges: transportCharges || row.transportCharges || 0,
                      loadingCharges: loadingCharges || row.loadingCharges || 0,
                      commission: commission || row.commission || 0,
                      otherCharges: otherCharges || row.otherCharges || 0,
                      deductions: deductions || row.deductions || 0,
                      totalInvoice: totalInvoice || row.totalInvoice || 0,
                      advancePaid: advancePaid || row.advancePaid || 0,
                      outstandingPayment: outstandingPayment || row.outstandingPayment || 0,
                      paymentMode: paymentMode || row.paymentMode || '',
                      totalPaymentMade: totalPaymentMade || row.totalPaymentMade || 0,
                      balanceAmount: balanceAmount || row.balanceAmount || 0,
                      dueDate: dueDate || row.dueDate || '',
                    };
                    resolve(Response.json({ success: true, data: createdOrder }, { status: 201 }));
                  }
                });
              }
            }
          );
        }).catch((colErr) => {
          console.warn('Error ensuring columns exist, using legacy insert:', colErr.message);
          insertLegacy();
        });
      });
    });
  } catch (error) {
    console.error('Error in POST /api/purchases:', error);

    if (error instanceof SyntaxError) {
      return Response.json(
        { error: 'Invalid JSON', message: 'Request body must be valid JSON' },
        { status: 400 }
      );
    }

    return Response.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/purchases
 * Deletes a purchase order by ID
 * Query params: id
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json(
        { error: 'Validation error', message: 'Purchase order ID is required' },
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
      db.run('DELETE FROM purchases WHERE id = ?', [id], function(err) {
        if (err) {
          console.error('Error deleting purchase order:', err.message);
          reject(
            Response.json(
              { error: 'Failed to delete purchase order', message: err.message },
              { status: 500 }
            )
          );
        } else {
          if (this.changes === 0) {
            resolve(
              Response.json(
                { error: 'Not found', message: 'Purchase order not found' },
                { status: 404 }
              )
            );
          } else {
            resolve(
              Response.json(
                { success: true, message: 'Purchase order deleted successfully' },
                { status: 200 }
              )
            );
          }
        }
      });
    });
  } catch (error) {
    console.error('Error in DELETE /api/purchases:', error);
    return Response.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
