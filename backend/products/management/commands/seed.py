"""
Seeds the store with high quality sample categories and products with exact matching images.

Usage:
    python manage.py seed [--reset]
"""

from django.core.management.base import BaseCommand
from django.utils.text import slugify
from products.models import Category, Product


# Every product has an exact, high-resolution, reliable image URL matched to its real display name.
SAMPLE_DATA = {
    'Electronics': [
        (
            'Logitech M330 Silent Wireless Mouse', 499.00, 45, 4.6,
            'Ergonomic 2.4GHz wireless mouse with 90% silent clicks, 1000 DPI optical tracking and 24-month battery life.',
            'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&fit=crop',
        ),
        (
            'RGB Mechanical Gaming Keyboard', 2299.00, 25, 4.8,
            'Hot-swappable tactile blue switches with dynamic per-key RGB backlighting and braided detachable Type-C cable.',
            'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&fit=crop',
        ),
        (
            '7-in-1 Aluminium USB-C Multiport Hub', 1499.00, 35, 4.5,
            '4K HDMI at 60Hz, 100W Power Delivery pass-through, SD/TF Card Reader, and 3x USB 3.0 ports in space grey aluminium.',
            'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800&fit=crop',
        ),
        (
            'Active Noise Cancelling TWS Bluetooth Earbuds', 1899.00, 50, 4.6,
            'Immersive deep bass, hybrid active noise cancellation, quad ENC microphones for crystal calls, and 36hr playback.',
            'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=800&fit=crop',
        ),
        (
            'Adjustable Aluminium Desktop Smartphone Stand', 349.00, 80, 4.4,
            'Heavy-duty dual-hinge metallic folding stand for iPhone, iPad, and Android tablets with anti-slip silicone cushions.',
            'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&fit=crop',
        ),
        (
            'AMOLED Display Bluetooth Calling Smartwatch', 2499.00, 30, 4.7,
            '1.43-inch vibrant always-on AMOLED screen, 120+ sports modes, SpO2 & 24/7 heart-rate monitor with metallic bezel.',
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&fit=crop',
        ),
        (
            '20000mAh Dual-Port Fast Charging Power Bank', 1299.00, 40, 4.5,
            '22.5W two-way fast charging with Type-C Power Delivery and dual USB outputs with 12-layer circuit chip protection.',
            'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&fit=crop',
        ),
        (
            'Portable Waterproof Fabric Bluetooth Speaker', 1199.00, 35, 4.4,
            'IPX7 rugged waterproof build, punchy bass passive radiator, 12 hours playtime with built-in braided carry lanyard.',
            'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&fit=crop',
        ),
        (
            'Over-Ear Studio Wireless ANC Headphones', 3499.00, 20, 4.9,
            'Ultra-soft memory foam ear cushions, 40mm Hi-Res neodymium drivers, 50-hour wireless battery life with fast charge.',
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&fit=crop',
        ),
        (
            '4K Ultra HD Webcam with Ring Light', 2199.00, 30, 4.5,
            'Auto-focus 4K webcam with built-in adjustable ring light, noise-canceling mic, and privacy shutter for streaming.',
            'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=800&fit=crop',
        ),
        (
            'Wireless Charging Pad 15W Qi Fast Charger', 599.00, 55, 4.3,
            'Ultra-slim aluminum Qi-certified wireless charger compatible with iPhone, Samsung, AirPods with LED indicator.',
            'https://images.unsplash.com/photo-1591815302525-756a9bcc3425?w=800&fit=crop',
        ),
    ],
    "Men's Fashion": [
        (
            'Premium 100% Combed Cotton Crewneck T-Shirt', 449.00, 75, 4.3,
            'Super-soft bio-washed breathable cotton t-shirt for daily comfort, casual wear, and layering.',
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&fit=crop',
        ),
        (
            'Classic Vintage Blue Denim Trucker Jacket', 1999.00, 25, 4.6,
            'Heavyweight durable denim, antique brass buttons, dual flap chest pockets, and a timeless relaxed fit.',
            'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&fit=crop',
        ),
        (
            'Ultra-Lightweight Mesh Running Sneakers', 1799.00, 40, 4.6,
            'Shock-absorbing cushioned EVA sole with breathable air-mesh upper for gym sessions, morning runs, and daily strolls.',
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&fit=crop',
        ),
        (
            'Handcrafted Slim Bifold Genuine Leather Wallet', 649.00, 60, 4.5,
            'Top-grain rich cowhide leather with RFID blocking technology, 8 card slots, and currency divider compartment.',
            'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&fit=crop',
        ),
        (
            'Water-Resistant Canvas Laptop Travel Backpack', 1499.00, 30, 4.7,
            '15.6-inch padded laptop compartment, reinforced stitching, external USB port, and ergonomic padded shoulder straps.',
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&fit=crop',
        ),
        (
            'Polarized Retro Metal Frame Sunglasses', 799.00, 50, 4.4,
            'UV400 protection polarized lenses with lightweight durable metallic alloy frame for driving and outdoors.',
            'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&fit=crop',
        ),
        (
            'Breathable Relaxed Fit Casual Linen Shirt', 999.00, 35, 4.4,
            'Pure linen-blend spread collar shirt crafted for warm summer days, weekend brunches, and evening outings.',
            'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&fit=crop',
        ),
        (
            'Slim Fit Formal Blazer Navy Blue', 3499.00, 20, 4.7,
            'Two-button single-breasted formal blazer with notch lapel, inner pocket, and tailored slim-fit silhouette.',
            'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&fit=crop',
        ),
        (
            'Athletic Performance Jogger Pants', 899.00, 45, 4.3,
            'Moisture-wicking stretch fabric joggers with zippered pockets, elastic waistband, and tapered ankle cuffs.',
            'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&fit=crop',
        ),
    ],
    "Women's Fashion": [
        (
            'Pure Banarasi Handwoven Kanjivaram Silk Saree', 3299.00, 20, 4.9,
            'Intricate gold zari floral jaal weaving with rich pallu and matching unstitched blouse piece for weddings & festivities.',
            'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&fit=crop',
        ),
        (
            'Embroidered Cotton Anarkali Kurti Set with Dupatta', 1499.00, 35, 4.7,
            'Soft pure cotton flared kurti with delicate thread embroidery, matching straight trousers, and printed dupatta.',
            'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&fit=crop',
        ),
        (
            'Bohemian Floral Print Tiered Summer Maxi Dress', 1199.00, 45, 4.5,
            'Breezy tiered silhouette with square neckline and ruffled sleeves in pastel botanical floral print.',
            'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&fit=crop',
        ),
        (
            'Luxury Quilted Crossbody Sling Bag with Golden Chain', 999.00, 50, 4.6,
            'Plush diamond-quilted PU leather with gold-tone twist lock and adjustable woven chain shoulder strap.',
            'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&fit=crop',
        ),
        (
            'Structured Vegan Leather Shoulder Tote Bag', 1699.00, 30, 4.6,
            'Spacious multi-pocket interior fits 13-inch laptop, tablet, cosmetics pouch, and daily work essentials.',
            'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&fit=crop',
        ),
        (
            '18K Gold-Plated Layered Floral Pendant Necklace', 699.00, 55, 4.5,
            'Anti-tarnish water-resistant double-layered dainty chain with delicate floral medallion pendant.',
            'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&fit=crop',
        ),
        (
            'Pointed-Toe Evening Classic Stiletto Pumps', 2199.00, 25, 4.4,
            'Cushioned insole with non-slip rubber outsole and 3.5-inch sleek heel for effortless party elegance.',
            'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&fit=crop',
        ),
        (
            'High-Waisted Vintage Straight-Leg Denim Jeans', 1399.00, 40, 4.4,
            'Flattering high-rise waist with premium stretch denim that hugs your shape comfortably all day.',
            'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&fit=crop',
        ),
        (
            'Printed Georgette A-Line Party Wear Dress', 1799.00, 30, 4.6,
            'Lightweight georgette fabric with vibrant digital prints, V-neck, and flared A-line silhouette for evening events.',
            'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&fit=crop',
        ),
    ],
    'Beauty & Personal Care': [
        (
            '10% Vitamin C Radiance & Brightening Face Serum', 599.00, 65, 4.7,
            'Formulated with 10% Ethyl Ascorbic Acid, Ferulic Acid and Hyaluronic Acid for even skin tone and glow.',
            'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&fit=crop',
        ),
        (
            'Velvet Matte Liquid Lipstick 4-Piece Nude Shades', 749.00, 50, 4.6,
            'Non-drying smudge-proof formula delivering intense 16-hour velvety matte color payoff.',
            'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&fit=crop',
        ),
        (
            'Cold-Pressed Organic Moroccan Argan Hair Elixir', 699.00, 40, 4.8,
            'Deeply nourishes split ends, tames flyaway frizz, restores natural shine, enriched with Vitamin E.',
            'https://images.unsplash.com/photo-1608248597359-58a0b07b34b1?w=800&fit=crop',
        ),
        (
            'Activated Charcoal Deep Pore Cleansing Face Wash', 349.00, 70, 4.4,
            'Pollution defense gentle foaming face cleanser with tea tree oil to draw out toxins and excess sebum.',
            'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&fit=crop',
        ),
        (
            'Luxury Eau De Parfum Spray - Royal Velvet Oud', 1299.00, 35, 4.7,
            'Exotic blend of Cambodian oud, velvety damask rose, amber, and smoky sandalwood in a 50ml glass spray.',
            'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&fit=crop',
        ),
        (
            'Natural Hydrating Gel Sunscreen SPF 50+ PA++++', 499.00, 80, 4.8,
            'Ultra-lightweight invisible water-gel texture with zero white cast and broad spectrum UV protection.',
            'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&fit=crop',
        ),
        (
            'Retinol Anti-Aging Night Repair Cream 50ml', 899.00, 35, 4.6,
            'Advanced retinol formula with peptides and niacinamide to reduce fine lines and boost overnight skin renewal.',
            'https://images.unsplash.com/photo-1570194065650-d99fb4a38691?w=800&fit=crop',
        ),
        (
            'Professional Hair Straightener Ceramic Flat Iron', 1499.00, 30, 4.5,
            'Tourmaline ceramic plates with adjustable temperature 150-230°C, auto-shutoff and 360° swivel cord.',
            'https://images.unsplash.com/photo-1522338242992-e1a54571a398?w=800&fit=crop',
        ),
    ],
    'Home & Kitchen': [
        (
            'Double-Wall Insulated Stainless Steel Water Bottle 1L', 499.00, 65, 4.5,
            '18/8 food-grade stainless steel keeps beverages piping hot for 12 hours or ice-cold for 24 hours.',
            'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&fit=crop',
        ),
        (
            'Induction-Safe Granite Non-Stick Frying Pan 28cm', 999.00, 35, 4.4,
            'Multi-layer PFOA-free granite mineral coating with heat-resistant stay-cool bakelite wooden-feel handle.',
            'https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=800&fit=crop',
        ),
        (
            'Fast-Boil 1500W Stainless Steel Electric Kettle 1.7L', 1199.00, 40, 4.6,
            'Rapid 3-minute boil with automatic dry-boil cutoff and 360-degree swivel cordless power base.',
            'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=800&fit=crop',
        ),
        (
            'Handcrafted Ceramic Coffee Mug Set (Set of 4)', 649.00, 45, 4.3,
            'Artisanal speckled studio pottery mugs, 350ml capacity, microwave and dishwasher safe.',
            'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&fit=crop',
        ),
        (
            'High-Carbon German Stainless Steel 6pc Chef Knife Set', 1799.00, 25, 4.7,
            'Razor-sharp laser-tested blades with solid acacia wood storage block and ergonomic balanced handles.',
            'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=800&fit=crop',
        ),
        (
            'Airtight Leakproof Borosilicate Glass Food Containers', 1099.00, 30, 4.6,
            'Set of 4 oven-safe glass meal prep containers with 4-sided snap locking silicone airtight lids.',
            'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&fit=crop',
        ),
        (
            '750W Powerful Mixer Grinder 3 Jar Set', 2499.00, 25, 4.5,
            'High-speed copper motor mixer grinder with stainless steel blades and 3 multipurpose jars for grinding and blending.',
            'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&fit=crop',
        ),
        (
            'Non-Stick Dosa Tawa Premium Flat Pan 30cm', 699.00, 50, 4.4,
            'Extra-thick aluminium base with 5-layer non-stick coating for perfect dosas, crepes, and uttapams every time.',
            'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800&fit=crop',
        ),
        (
            'Digital Kitchen Weighing Scale 10kg', 449.00, 60, 4.3,
            'High precision digital scale with LCD display, tare function, and tempered glass platform for precise cooking.',
            'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&fit=crop',
        ),
    ],
    'Home Decor & Lighting': [
        (
            'Dimmable Touch Sensor Eye-Care LED Desk Lamp', 899.00, 40, 4.5,
            '5 color temperature modes, 10 brightness levels, 45-minute auto-timer with USB phone charging port.',
            'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=800&fit=crop',
        ),
        (
            'Hand-Woven Bohemian Macrame Wall Hanging Tapestry', 799.00, 30, 4.6,
            '100% natural organic cotton cord woven on sturdy pine dowel for warm Scandinavian aesthetic.',
            'https://images.unsplash.com/photo-1582582494705-f8ce0b0c24f0?w=800&fit=crop',
        ),
        (
            'Modern Ribbed Ceramic Flower & Pampas Grass Vase', 649.00, 40, 4.4,
            'Matte off-white textured ceramic centerpiece vase perfect for dried florals, eucalyptus, and fresh blooms.',
            'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&fit=crop',
        ),
        (
            'Warm Amber Micro LED Fairy String Lights 10m', 299.00, 90, 4.5,
            '100 waterproof warm glow micro LEDs on bendable copper wire, USB powered with 8 lighting modes.',
            'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&fit=crop',
        ),
        (
            'Ultrasonic Essential Oil Aromatherapy Aroma Diffuser', 1299.00, 25, 4.7,
            '500ml capacity wood-grain ultrasonic mist humidifier with 7 soothing ambient LED mood lights.',
            'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&fit=crop',
        ),
        (
            'Collapsible Canvas Laundry & Storage Basket Organiser', 549.00, 50, 4.3,
            'Waterproof PE coating with reinforced cotton rope carry handles for clothes, linens, and living room storage.',
            'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&fit=crop',
        ),
        (
            'Wooden Photo Frame Collage Set of 8', 999.00, 35, 4.4,
            'Mix of 4x6 and 5x7 inch frames in walnut finish for creating a beautiful gallery wall display.',
            'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&fit=crop',
        ),
    ],
    'Books & Learning': [
        (
            'Atomic Habits by James Clear', 449.00, 60, 4.9,
            'An easy & proven way to build good habits and break bad ones. Over 15 million copies sold globally.',
            'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&fit=crop',
        ),
        (
            'Clean Code by Robert C. Martin', 699.00, 35, 4.8,
            'A handbook of agile software craftsmanship. The definitive industry guide to readable, maintainable software.',
            'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&fit=crop',
        ),
        (
            'The Pragmatic Programmer: 20th Anniversary Edition', 749.00, 25, 4.8,
            'Your journey to mastery by David Thomas and Andrew Hunt. Classic lessons for modern software engineers.',
            'https://images.unsplash.com/photo-1589998059171-988d887df646?w=800&fit=crop',
        ),
        (
            'Deep Work: Rules for Focused Success by Cal Newport', 499.00, 40, 4.7,
            'How to cultivate intense concentration and achieve peak productivity without distraction.',
            'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&fit=crop',
        ),
        (
            'The Psychology of Money by Morgan Housel', 399.00, 70, 4.8,
            'Timeless lessons on wealth, greed, and happiness. Doing well with money is about behavior, not math.',
            'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=800&fit=crop',
        ),
        (
            'Python Crash Course 3rd Edition by Eric Matthes', 649.00, 30, 4.7,
            'The world bestselling guide to Python programming with hands-on real projects for data, games, and web apps.',
            'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&fit=crop',
        ),
        (
            'Sapiens: A Brief History of Humankind by Yuval Noah Harari', 499.00, 50, 4.8,
            'A groundbreaking narrative of humanity from the Stone Age to the present day. International bestseller.',
            'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&fit=crop',
        ),
        (
            'Think and Grow Rich by Napoleon Hill', 299.00, 65, 4.6,
            'The original personal finance classic that has inspired millions to achieve success and wealth.',
            'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&fit=crop',
        ),
    ],
    # ===== NEW CATEGORIES =====
    'Groceries & Essentials': [
        (
            'Organic Basmati Rice Premium 5kg', 549.00, 100, 4.7,
            'Naturally aged long-grain basmati rice with aromatic fragrance, perfect for biryanis and pulao.',
            'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&fit=crop',
        ),
        (
            'Cold-Pressed Extra Virgin Olive Oil 1L', 799.00, 60, 4.6,
            'First-press premium olive oil from Mediterranean olives, ideal for salads, cooking, and marinades.',
            'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&fit=crop',
        ),
        (
            'Natural Raw Honey Multiflora 500g', 399.00, 80, 4.8,
            'Unprocessed raw forest honey with natural enzymes and antioxidants, sourced from Himalayan bee farms.',
            'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&fit=crop',
        ),
        (
            'Premium Whole Wheat Atta 10kg', 449.00, 120, 4.5,
            'Stone-ground whole wheat flour rich in fibre and nutrients for soft rotis and healthy chapatis.',
            'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&fit=crop',
        ),
        (
            'Assorted Dry Fruits Gift Box 1kg', 1299.00, 40, 4.7,
            'Premium selection of almonds, cashews, pistachios, and raisins in an elegant wooden gift box.',
            'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=800&fit=crop',
        ),
        (
            'Organic Green Tea Loose Leaf 250g', 349.00, 70, 4.5,
            'Handpicked Darjeeling green tea leaves rich in antioxidants for a refreshing and healthy daily brew.',
            'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&fit=crop',
        ),
        (
            'Toor Dal Unpolished Organic 2kg', 299.00, 90, 4.4,
            'Farm-fresh unpolished toor dal for authentic homestyle dal tadka, sambar, and rasam preparations.',
            'https://images.unsplash.com/photo-1612257999756-530dce4f4b26?w=800&fit=crop',
        ),
        (
            'Cold-Pressed Coconut Oil Virgin 1L', 449.00, 65, 4.6,
            'Pure unrefined virgin coconut oil for cooking, skin care, and hair care with natural coconut aroma.',
            'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=800&fit=crop',
        ),
        (
            'Instant Masala Oats Variety Pack 12 Sachets', 249.00, 100, 4.3,
            'Quick 3-minute breakfast oats in masala, tomato, and peppy flavors with real spice blends and veggies.',
            'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=800&fit=crop',
        ),
        (
            'Premium Saffron Threads Kashmiri 1g', 499.00, 30, 4.9,
            'Genuine Grade-1 Kashmiri Kesar saffron threads for biryanis, desserts, and milk with rich color and aroma.',
            'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&fit=crop',
        ),
    ],
    'Sports & Fitness': [
        (
            'Anti-Burst Exercise Ball 65cm with Pump', 599.00, 45, 4.4,
            'Professional-grade PVC exercise ball for yoga, pilates, core strengthening, and balance training.',
            'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&fit=crop',
        ),
        (
            'Adjustable Dumbbell Set 20kg with Case', 2999.00, 20, 4.7,
            'Cement-filled adjustable dumbbells with chrome-plated bars and spin-lock collars in a carrying case.',
            'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&fit=crop',
        ),
        (
            'Premium Yoga Mat 6mm Anti-Slip TPE', 799.00, 55, 4.6,
            'Eco-friendly TPE material with dual-sided texture for superior grip, alignment lines, and carrying strap.',
            'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&fit=crop',
        ),
        (
            'Digital Skipping Rope with Counter', 449.00, 70, 4.5,
            'Ball-bearing speed rope with digital LCD counter, calorie tracker, and adjustable length for HIIT cardio.',
            'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800&fit=crop',
        ),
        (
            'Resistance Bands Set 5 Levels with Bag', 499.00, 60, 4.5,
            'Latex-free TPE resistance bands in 5 progressive levels for strength training, rehab, and stretching.',
            'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&fit=crop',
        ),
        (
            'Stainless Steel Protein Shaker Bottle 700ml', 399.00, 80, 4.3,
            'Leak-proof shaker with wire ball for smooth mixing, measurement markings, and BPA-free flip cap.',
            'https://images.unsplash.com/photo-1593095948071-474c5cc2c4d8?w=800&fit=crop',
        ),
        (
            'Professional Boxing Hand Wraps 180 inch Pair', 299.00, 60, 4.4,
            'Semi-elastic cotton hand wraps with thumb loop and velcro closure for boxing, MMA, and kickboxing.',
            'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&fit=crop',
        ),
        (
            'Foam Roller Deep Tissue Massage 18 inch', 699.00, 40, 4.6,
            'High-density EVA foam roller with textured grid for myofascial release, muscle recovery, and flexibility.',
            'https://images.unsplash.com/photo-1570655652364-2e0a67455ac6?w=800&fit=crop',
        ),
        (
            'Cricket Bat English Willow Grade A', 3999.00, 15, 4.8,
            'Hand-crafted English willow bat with premium cane handle, toe guard, and anti-scuff sheet for match play.',
            'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&fit=crop',
        ),
        (
            'Football Official Size 5 Match Ball', 999.00, 35, 4.5,
            'Machine-stitched PU leather match ball with butyl bladder for excellent air retention and consistent bounce.',
            'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&fit=crop',
        ),
    ],
    'Toys & Baby Products': [
        (
            'Building Blocks 100pc Creative Set', 799.00, 40, 4.6,
            'Colorful interlocking building blocks for ages 3+ to develop creativity, motor skills, and spatial thinking.',
            'https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=800&fit=crop',
        ),
        (
            'Remote Control Racing Car 2.4GHz Off-Road', 1499.00, 25, 4.5,
            'High-speed 4WD RC car with rechargeable battery, rubber tires, and 2.4GHz remote for outdoor racing fun.',
            'https://images.unsplash.com/photo-1581235707960-23b7e8f7e4c6?w=800&fit=crop',
        ),
        (
            'Stuffed Teddy Bear Premium Plush 60cm', 699.00, 50, 4.7,
            'Ultra-soft huggable teddy bear with hypoallergenic polyester filling and satin ribbon bow tie.',
            'https://images.unsplash.com/photo-1559715541-5daf8a0296d0?w=800&fit=crop',
        ),
        (
            'Baby Stroller Lightweight Foldable with Canopy', 4999.00, 15, 4.8,
            'One-hand fold aluminum frame stroller with 5-point harness, adjustable canopy, and storage basket.',
            'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&fit=crop',
        ),
        (
            'Wooden Alphabet Learning Puzzle Board', 449.00, 60, 4.5,
            'Colorful wooden A-Z alphabet puzzle with chunky pieces for toddlers, Montessori-style early learning.',
            'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&fit=crop',
        ),
        (
            'Baby Feeding Bottle Set BPA-Free 3-Pack', 599.00, 55, 4.4,
            'Anti-colic wide-neck bottles with silicone nipples in 3 sizes (150ml, 240ml, 300ml) for newborn to 12 months.',
            'https://images.unsplash.com/photo-1584839404024-537f21a3e59c?w=800&fit=crop',
        ),
        (
            'Musical Activity Play Mat for Infants', 1299.00, 30, 4.6,
            'Soft padded play gym with detachable hanging toys, mirror, and music box for sensory development 0-12 months.',
            'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&fit=crop',
        ),
        (
            'Kids Science Experiment Kit 60+ Experiments', 899.00, 35, 4.7,
            'Educational STEM science kit with lab equipment for chemistry, physics, and biology experiments ages 8+.',
            'https://images.unsplash.com/photo-1596496181848-3091d4878b24?w=800&fit=crop',
        ),
    ],
    'Health & Wellness': [
        (
            'Digital Blood Pressure Monitor Automatic', 1299.00, 35, 4.6,
            'Clinically validated upper arm BP monitor with large LCD display, irregular heartbeat detection, and memory.',
            'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&fit=crop',
        ),
        (
            'Multivitamin Daily Tablets 60 Count', 499.00, 80, 4.5,
            'Complete A-Z multivitamin and mineral supplement with iron, zinc, and B-complex for daily health support.',
            'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&fit=crop',
        ),
        (
            'Whey Protein Powder Chocolate 1kg', 1999.00, 40, 4.7,
            '24g protein per serving with BCAA and digestive enzymes. Low sugar, high absorption whey isolate blend.',
            'https://images.unsplash.com/photo-1593095948071-474c5cc2c4d8?w=800&fit=crop',
        ),
        (
            'Infrared Digital Thermometer Non-Contact', 699.00, 55, 4.4,
            'Instant 1-second forehead temperature reading with fever alarm, LCD backlight, and 32 memory recall.',
            'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&fit=crop',
        ),
        (
            'Orthopaedic Memory Foam Pillow', 1499.00, 30, 4.6,
            'Contoured cervical pillow with cooling gel layer for neck and spine alignment during sleep.',
            'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&fit=crop',
        ),
        (
            'Omega-3 Fish Oil Capsules 1000mg 90 Count', 599.00, 65, 4.5,
            'High potency EPA/DHA omega-3 fatty acids from deep-sea fish for heart, brain, and joint health support.',
            'https://images.unsplash.com/photo-1550572017-edd951b55104?w=800&fit=crop',
        ),
        (
            'Electric Heating Pad for Pain Relief', 899.00, 40, 4.4,
            'Soft micro-plush heating pad with 3 heat settings, auto-shutoff timer, and washable cover for body aches.',
            'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&fit=crop',
        ),
        (
            'Copper Water Bottle Ayurvedic 1L', 699.00, 45, 4.5,
            'Handcrafted pure copper bottle for storing drinking water, supports Ayurvedic health and digestion benefits.',
            'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&fit=crop',
        ),
    ],
    'Stationery & Office': [
        (
            'Premium Notebook A5 Hardcover 200 Pages', 349.00, 70, 4.5,
            'Acid-free cream paper with lay-flat binding, elastic closure, ribbon bookmark, and inner pocket.',
            'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&fit=crop',
        ),
        (
            'Gel Pen Set 12 Colors Fine Tip 0.5mm', 199.00, 100, 4.4,
            'Smooth-flowing quick-dry gel ink pens with comfortable rubber grip for writing, drawing, and journaling.',
            'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&fit=crop',
        ),
        (
            'Desk Organiser Wooden Multi-Compartment', 599.00, 40, 4.3,
            'Natural bamboo desktop organiser with slots for pens, phone, sticky notes, and business cards.',
            'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800&fit=crop',
        ),
        (
            'Ergonomic Office Chair with Lumbar Support', 7999.00, 12, 4.7,
            'Mesh back breathable chair with adjustable height, armrests, headrest, and 360° swivel base.',
            'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&fit=crop',
        ),
        (
            'Whiteboard Magnetic 60x90cm with Markers', 1299.00, 25, 4.4,
            'Lacquered steel surface magnetic whiteboard with aluminium frame, 4 markers, eraser, and mounting kit.',
            'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=800&fit=crop',
        ),
        (
            'Scientific Calculator FX-991 Advanced', 899.00, 50, 4.6,
            '417 functions including matrix, vector, statistics, and equation solving. Solar + battery powered.',
            'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=800&fit=crop',
        ),
        (
            'Art Supplies Drawing Set 72 Pieces', 999.00, 35, 4.5,
            'Professional sketching kit with graphite, charcoal, colored pencils, blending stumps, and zippered case.',
            'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&fit=crop',
        ),
        (
            'Sticky Notes Neon Assorted Pack 400 Sheets', 149.00, 120, 4.3,
            '8 neon colors 3x3 inch self-adhesive sticky notes for reminders, bookmarking, and office organisation.',
            'https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?w=800&fit=crop',
        ),
    ],
    'Automotive & Accessories': [
        (
            'Car Dash Camera Full HD 1080p with Night Vision', 2499.00, 25, 4.6,
            'Wide 170° angle dash cam with G-sensor, loop recording, parking monitor, and night vision for road safety.',
            'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&fit=crop',
        ),
        (
            'Car Phone Mount Magnetic Air Vent', 399.00, 80, 4.4,
            'Strong neodymium magnet car mount with 360° rotation for hands-free navigation on any smartphone.',
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=800&fit=crop',
        ),
        (
            'Car Vacuum Cleaner Portable 12V 120W', 999.00, 40, 4.3,
            'Powerful cordless handheld vacuum with HEPA filter, wet/dry suction, and LED light for car interior cleaning.',
            'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&fit=crop',
        ),
        (
            'Tyre Inflator Digital Portable Air Compressor', 1499.00, 30, 4.5,
            'Digital preset 12V tyre inflator with auto-stop, LED flashlight, and multiple nozzles for car, bike, and balls.',
            'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&fit=crop',
        ),
        (
            'Car Seat Cover PU Leather Full Set', 2999.00, 20, 4.4,
            'Premium faux leather universal seat covers with side airbag compatible design and anti-slip backing.',
            'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&fit=crop',
        ),
        (
            'LED Car Interior Ambient Lighting Strip Kit', 599.00, 55, 4.3,
            'RGB multi-color LED strips with app and music sync control, waterproof adhesive for under-dash ambiance.',
            'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&fit=crop',
        ),
        (
            'Motorcycle Riding Gloves Touchscreen Compatible', 799.00, 45, 4.5,
            'Breathable mesh gloves with knuckle protection, anti-slip palm grip, and touchscreen fingertip compatibility.',
            'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&fit=crop',
        ),
        (
            'Car Air Freshener Premium Perfume Set of 3', 349.00, 70, 4.2,
            'Long-lasting organic car perfumes in lavender, ocean breeze, and citrus scents with vent clip design.',
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=800&fit=crop',
        ),
    ],
}


class Command(BaseCommand):
    help = 'Seeds the catalog with sample categories and products with exact matched images.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset', action='store_true',
            help='Delete all existing products/categories before seeding.',
        )

    def handle(self, *args, **options):
        if options['reset']:
            Product.objects.all().delete()
            Category.objects.all().delete()
            self.stdout.write(self.style.WARNING('Cleared existing products and categories.'))

        created_categories = 0
        created_products = 0
        updated_products = 0

        for category_name, products in SAMPLE_DATA.items():
            category, cat_created = Category.objects.get_or_create(
                name=category_name, defaults={'slug': slugify(category_name)}
            )
            if cat_created:
                created_categories += 1

            for name, price, stock, rating, description, image_url in products:
                product, prod_created = Product.objects.get_or_create(
                    name=name,
                    defaults={
                        'category': category,
                        'slug': slugify(name),
                        'price': price,
                        'stock': stock,
                        'rating': rating,
                        'description': description,
                        'image_url': image_url,
                        'is_active': True,
                    },
                )
                if prod_created:
                    created_products += 1
                    continue

                expected_values = {
                    'category': category,
                    'slug': slugify(name),
                    'price': price,
                    'stock': stock,
                    'rating': rating,
                    'description': description,
                    'image_url': image_url,
                    'is_active': True,
                }
                changed_fields = [
                    field for field, value in expected_values.items()
                    if getattr(product, field) != value
                ]
                if changed_fields:
                    for field in changed_fields:
                        setattr(product, field, expected_values[field])
                    product.save(update_fields=changed_fields)
                    updated_products += 1

        total = sum(len(products) for products in SAMPLE_DATA.values())
        msg = (
            f'Done. {len(SAMPLE_DATA)} categories ({created_categories} new). '
            f'{total} total products ({created_products} created, {updated_products} updated).'
        )
        self.stdout.write(self.style.SUCCESS(msg))
