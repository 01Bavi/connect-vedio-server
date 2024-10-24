const express = require('express');
const Product = require('../models/ProductModel'); // Adjust the path as needed
const router = express.Router(); // Use router instead of app

// Basic routes
router.get('/blog', (req, res) => {
    res.send('Hello Blog');
});

// Get all products
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add a new product
router.post('/products', async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: 'Product data is required' });
        }

        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product); // 201: Created
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
});

// Update product
router.put('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(updatedProduct); // 200: OK
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Export the router so it can be used in server.js
module.exports = router;
