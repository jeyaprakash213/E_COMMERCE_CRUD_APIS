const { Product, userModel } = require('./model');

module.exports = {
    pages: async (req, res) => {
        try {
            const { keyword, category, page = 1, limit = 1 } = req.query;

            // Construct query object for filtering
            const query = {};
            if (keyword) {
                query.$or = [
                    { productName: { $regex: keyword, $options: 'i' } }, // Case-insensitive search for product name
                    { description: { $regex: keyword, $options: 'i' } } // Case-insensitive search for product description
                ];
            }
            if (category) {
                query.category = category;
            }

            // Count total number of products matching the search criteria
            const totalCount = await Product.countDocuments(query);

            // Calculate pagination values
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;

            // Find products with pagination
            const products = await Product.find(query)
                .limit(limit)
                .skip(startIndex)
                .exec();

            // Pagination result object
            const paginationResult = {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalCount: totalCount
            };

            // Add previous and next page links if available
            if (endIndex < totalCount) {
                paginationResult.nextPage = page + 1;
            }
            if (startIndex > 0) {
                paginationResult.prevPage = page - 1;
            }

            res.json({ pagination: paginationResult, products });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

};