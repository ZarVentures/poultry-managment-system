const { getDatabase } = require('@/lib/db');

/**
 * GET /api/products
 * Returns all products from the database
 */
export async function GET() {
  try {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM products ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
          console.error('Error fetching products:', err.message);
          reject(
            Response.json(
              { error: 'Failed to fetch products', message: err.message },
              { status: 500 }
            )
          );
        } else {
          resolve(Response.json({ success: true, data: rows }, { status: 200 }));
        }
      });
    });
  } catch (error) {
    console.error('Error in GET /api/products:', error);
    return Response.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * Creates a new product
 * Body: { name: string, category?: string, price?: number }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, category, price } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return Response.json(
        { error: 'Validation error', message: 'Product name is required' },
        { status: 400 }
      );
    }

    // Validate price if provided
    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return Response.json(
        { error: 'Validation error', message: 'Price must be a non-negative number' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO products (name, category, price) VALUES (?, ?, ?)',
        [name.trim(), category?.trim() || null, price !== undefined ? price : null],
        function(err) {
          if (err) {
            console.error('Error creating product:', err.message);
            reject(
              Response.json(
                { error: 'Failed to create product', message: err.message },
                { status: 500 }
              )
            );
          } else {
            // Fetch the created product
            db.get('SELECT * FROM products WHERE id = ?', [this.lastID], (err, row) => {
              if (err) {
                console.error('Error fetching created product:', err.message);
                resolve(
                  Response.json(
                    {
                      success: true,
                      message: 'Product created successfully',
                      data: { id: this.lastID, name, category, price },
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
  } catch (error) {
    console.error('Error in POST /api/products:', error);

    // Handle JSON parsing errors
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

