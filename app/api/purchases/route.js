const { getDatabase } = require('@/lib/db');

/**
 * GET /api/purchases
 * Returns all purchase orders from the database
 */
export async function GET() {
  try {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM purchases ORDER BY date DESC, created_at DESC', [], (err, rows) => {
        if (err) {
          console.error('Error fetching purchases:', err.message);
          reject(
            Response.json(
              { error: 'Failed to fetch purchases', message: err.message },
              { status: 500 }
            )
          );
        } else {
          resolve(Response.json({ success: true, data: rows }, { status: 200 }));
        }
      });
    });
  } catch (error) {
    console.error('Error in GET /api/purchases:', error);
    return Response.json(
      { error: 'Internal server error', message: error.message },
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
    const db = getDatabase();
    
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
              console.error('Error creating purchase order:', err.message);
              reject(
                Response.json(
                  { error: 'Failed to create purchase order', message: err.message },
                  { status: 500 }
                )
              );
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
                    purchaseType: purchaseType || 'Cash',
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
                    purchaseInvoiceNo: purchaseInvoiceNo || row.orderNumber,
                    purchaseDate: purchaseDate || row.date,
                    farmerName: farmerName || row.supplier,
                    farmerMobile: farmerMobile || '',
                    farmLocation: farmLocation || '',
                    vehicleNo: vehicleNo || '',
                    purchaseType: purchaseType || 'Cash',
                    birdType: birdType || '',
                    numberOfCages: numberOfCages || row.cageQuantity || 0,
                    numberOfBirds: numberOfBirds || row.birdQuantity || 0,
                    ratePerKg: ratePerKg || row.unitCost || 0,
                    averageWeight: averageWeight || 0,
                    totalWeight: totalWeight || 0,
                    totalAmount: totalAmount || row.totalValue || 0,
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
                  };
                  resolve(Response.json({ success: true, data: createdOrder }, { status: 201 }));
                }
              });
            }
          }
        );
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

