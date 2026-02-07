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
 * Body: { supplier, date, description, birdQuantity, cageQuantity, unitCost, status, notes }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { supplier, date, description, birdQuantity, cageQuantity, unitCost, status, notes } = body;

    // Validate required fields
    if (!supplier || !date || !description || birdQuantity === undefined || unitCost === undefined) {
      return Response.json(
        { error: 'Validation error', message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const totalValue = (parseFloat(birdQuantity) || 0) * (parseFloat(unitCost) || 0);
    
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

        const orderNumber = `PO-${String((row.count || 0) + 1).padStart(3, '0')}`;

        db.run(
          `INSERT INTO purchases (orderNumber, supplier, date, description, birdQuantity, cageQuantity, unitCost, totalValue, status, notes) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderNumber,
            supplier.trim(),
            date,
            description.trim(),
            parseInt(birdQuantity) || 0,
            parseInt(cageQuantity) || 0,
            parseFloat(unitCost) || 0,
            totalValue,
            status || 'pending',
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
                  resolve(
                    Response.json(
                      {
                        success: true,
                        message: 'Purchase order created successfully',
                        data: { id: this.lastID, orderNumber, supplier, date, description, birdQuantity, cageQuantity, unitCost, totalValue, status, notes },
                      },
                      { status: 201 }
                    )
                  );
                } else {
                  resolve(Response.json({ success: true, data: row }, { status: 201 }));
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

