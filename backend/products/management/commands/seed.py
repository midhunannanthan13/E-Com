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

        msg = f'Done. Categories: {created_categories} added. Products: {created_products} created, {updated_products} updated.'
        self.stdout.write(self.style.SUCCESS(msg))
