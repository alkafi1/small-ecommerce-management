<?php

/*
| Demo data for DatabaseSeeder. "by" is the key of the user who created the
| product; "image" is a file in database/seeders/images.
*/

return [
    'products' => [
        // Created by the admin
        ['key' => 'tshirt', 'by' => 'admin', 'name' => 'Classic Cotton T-Shirt', 'sku' => 'APP-TSH-001', 'price' => 450, 'color' => '#2563eb', 'description' => 'Soft 100% combed cotton crew-neck tee. Breathable and pre-shrunk.'],
        ['key' => 'jeans', 'by' => 'admin', 'name' => 'Slim Fit Denim Jeans', 'sku' => 'APP-JNS-002', 'price' => 1450, 'color' => '#1e3a8a', 'description' => 'Stretch denim with a modern slim fit and five-pocket styling.'],
        ['key' => 'wallet', 'by' => 'admin', 'name' => 'Leather Wallet', 'sku' => 'ACC-WAL-003', 'price' => 890, 'color' => '#92400e', 'description' => 'Genuine leather bi-fold wallet with 6 card slots.'],
        ['key' => 'sneakers', 'by' => 'admin', 'name' => 'Running Sneakers', 'sku' => 'FTW-RUN-004', 'price' => 2650, 'color' => '#dc2626', 'description' => 'Lightweight mesh upper with cushioned sole for daily runs.'],
        ['key' => 'earbuds', 'by' => 'admin', 'name' => 'Wireless Earbuds', 'sku' => 'ELC-EAR-005', 'price' => 1990, 'color' => '#0f172a', 'description' => 'Bluetooth 5.3 earbuds with 24-hour battery life and charging case.'],
        ['key' => 'watch', 'by' => 'admin', 'name' => 'Smart Watch', 'sku' => 'ELC-WAT-006', 'price' => 3500, 'color' => '#7c3aed', 'description' => 'Heart-rate, sleep and step tracking with a 1.8" display.'],
        ['key' => 'bottle', 'by' => 'admin', 'name' => 'Stainless Steel Water Bottle', 'sku' => 'HOM-BTL-007', 'price' => 650, 'color' => '#0891b2', 'description' => 'Double-wall insulated, keeps drinks cold for 24 hours. 750 ml.'],
        ['key' => 'mug', 'by' => 'admin', 'name' => 'Ceramic Coffee Mug', 'sku' => 'HOM-MUG-008', 'price' => 320, 'color' => '#b45309', 'description' => 'Glazed ceramic mug, 350 ml, microwave and dishwasher safe.'],
        ['key' => 'backpack', 'by' => 'admin', 'name' => 'Travel Backpack 25L', 'sku' => 'ACC-BAG-009', 'price' => 1850, 'color' => '#15803d', 'description' => 'Water-resistant backpack with a padded laptop sleeve.'],
        ['key' => 'lamp', 'by' => 'admin', 'name' => 'LED Desk Lamp', 'sku' => 'HOM-LMP-010', 'price' => 1200, 'color' => '#ca8a04', 'description' => 'Dimmable LED lamp with 3 colour modes and USB charging port.'],
        ['key' => 'speaker', 'by' => 'admin', 'name' => 'Bluetooth Speaker', 'sku' => 'ELC-SPK-011', 'price' => 2200, 'color' => '#be123c', 'description' => 'Portable speaker with deep bass and IPX5 splash resistance.'],
        ['key' => 'sunglasses', 'by' => 'admin', 'name' => 'UV400 Sunglasses', 'sku' => 'ACC-SUN-012', 'price' => 750, 'color' => '#334155', 'description' => 'Polarised lenses with full UV400 protection.'],
        // Not listed by any shop: must NOT appear on the storefront
        ['key' => 'camera', 'by' => 'admin', 'name' => 'Vintage Film Camera', 'sku' => 'ELC-CAM-013', 'price' => 8500, 'color' => '#57534e', 'description' => 'Restored 35 mm film camera. Not listed in any shop yet.'],
        // Inactive in the catalog: hidden everywhere even though a shop lists it
        ['key' => 'kettle', 'by' => 'admin', 'name' => 'Electric Kettle (Discontinued)', 'sku' => 'HOM-KTL-014', 'price' => 1100, 'color' => '#64748b', 'description' => 'Discontinued item kept for order history.', 'is_active' => false],

        // Created by shop owner 1 (shared to the catalog)
        ['key' => 'cushion', 'by' => 'owner1', 'name' => 'Nakshi Kantha Cushion Cover', 'sku' => 'CRF-CSH-101', 'price' => 550, 'color' => '#c2410c', 'description' => 'Hand-stitched nakshi kantha cushion cover, 16" x 16".'],
        ['key' => 'tea', 'by' => 'owner1', 'name' => 'Organic Green Tea 100g', 'sku' => 'GRC-TEA-102', 'price' => 380, 'color' => '#4d7c0f', 'description' => 'Hand-picked organic green tea leaves from Sylhet.'],
        ['key' => 'saree', 'by' => 'owner1', 'name' => 'Jamdani Saree', 'sku' => 'APP-SAR-103', 'price' => 6800, 'color' => '#9d174d', 'description' => 'Traditional handwoven Dhakai jamdani saree.'],
        ['key' => 'vase', 'by' => 'owner1', 'name' => 'Terracotta Flower Vase', 'sku' => 'CRF-VAS-104', 'price' => 480, 'color' => '#9a3412', 'description' => 'Handmade terracotta vase with traditional motifs.'],

        // Created by shop owner 2 (shared to the catalog)
        ['key' => 'case', 'by' => 'owner2', 'name' => 'Shockproof Phone Case', 'sku' => 'ELC-CAS-201', 'price' => 350, 'color' => '#0369a1', 'description' => 'Clear TPU case with reinforced corners.'],
        ['key' => 'charger', 'by' => 'owner2', 'name' => 'USB-C Fast Charger 25W', 'sku' => 'ELC-CHG-202', 'price' => 990, 'color' => '#1f2937', 'description' => 'PD 3.0 fast charger with overheat protection.'],
        ['key' => 'stand', 'by' => 'owner2', 'name' => 'Aluminium Laptop Stand', 'sku' => 'ELC-STD-203', 'price' => 1650, 'color' => '#6b7280', 'description' => 'Adjustable height stand for 10"–17" laptops.'],
    ],

    'shops' => [
        ['key' => 'fashion', 'owner' => 'owner1', 'name' => 'Dhaka Fashion House', 'description' => 'Everyday clothing and accessories at fair prices.', 'color' => '#db2777'],
        ['key' => 'crafts', 'owner' => 'owner1', 'name' => 'Deshi Crafts & Living', 'description' => 'Handmade crafts, home goods and organic groceries.', 'color' => '#ea580c'],
        ['key' => 'gadget', 'owner' => 'owner2', 'name' => 'Gadget Point', 'description' => 'Phones, audio and everyday tech accessories.', 'color' => '#2563eb'],
        // Inactive shop: its listings must NOT appear on the storefront
        ['key' => 'popup', 'owner' => 'owner2', 'name' => 'Winter Pop-up Store', 'description' => 'Seasonal store, currently closed.', 'color' => '#475569', 'is_active' => false],
    ],

    /*
    | Listings per shop. Optional overrides: name, description, image, is_visible.
    */
    'listings' => [
        'fashion' => [
            ['product' => 'tshirt', 'price' => 499, 'name' => 'Classic Cotton Tee – Red Edition', 'image' => 'listing-tshirt-red'],
            ['product' => 'jeans', 'price' => 1590],
            ['product' => 'wallet', 'price' => 950],
            ['product' => 'sneakers', 'price' => 2790],
            ['product' => 'sunglasses', 'price' => 790],
            ['product' => 'backpack', 'price' => 1990],
            ['product' => 'saree', 'price' => 7200],
            ['product' => 'watch', 'price' => 3650, 'is_visible' => false],
        ],
        'crafts' => [
            ['product' => 'cushion', 'price' => 590],
            ['product' => 'tea', 'price' => 399],
            ['product' => 'vase', 'price' => 520],
            ['product' => 'mug', 'price' => 350, 'description' => 'Perfect partner for our organic green tea.'],
            ['product' => 'lamp', 'price' => 1290],
            ['product' => 'bottle', 'price' => 690],
            ['product' => 'kettle', 'price' => 1150],
        ],
        'gadget' => [
            ['product' => 'earbuds', 'price' => 1890],
            ['product' => 'watch', 'price' => 3399],
            ['product' => 'speaker', 'price' => 2150],
            ['product' => 'case', 'price' => 299],
            ['product' => 'charger', 'price' => 949],
            ['product' => 'stand', 'price' => 1599],
            ['product' => 'tshirt', 'price' => 420, 'name' => 'Gadget Point Logo Tee'],
            ['product' => 'bottle', 'price' => 640],
        ],
        'popup' => [
            ['product' => 'mug', 'price' => 300],
            ['product' => 'sunglasses', 'price' => 700],
        ],
    ],
];
