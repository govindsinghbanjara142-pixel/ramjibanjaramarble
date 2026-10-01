import { BusinessSettings, Category, Order, Product } from '../types';

export const defaultCategories: Category[] = [
  {
    id: 'cat-marble',
    name: 'Marble',
    slug: 'marble',
    description: 'World-renowned Makrana and premium Indian marbles, quarried and polished to perfection for opulent flooring, cladding, and architectural features.',
    image: '/src/assets/images/makrana_white_marble_1790747884116.jpg',
    subcategories: [
      'Makrana Marble',
      'White Marble',
      'Green Marble',
      'Black Marble',
      'Beige Marble',
      'Onyx Marble',
      'Marble Slabs',
      'Marble Tiles',
      'Marble Blocks',
      'Marble Sheets',
      'Other Marble Products'
    ]
  },
  {
    id: 'cat-granite',
    name: 'Granite',
    slug: 'granite',
    description: 'High-density, weather-resistant natural granites in premium black, white, grey, red, and green finishes, ideal for kitchen countertops, steps, and commercial facades.',
    image: '/src/assets/images/black_granite_slab_1790747898296.jpg',
    subcategories: [
      'Black Granite',
      'White Granite',
      'Grey Granite',
      'Red Granite',
      'Green Granite',
      'Granite Slabs',
      'Granite Tiles',
      'Granite Blocks',
      'Other Granite Products'
    ]
  },
  {
    id: 'cat-handicraft',
    name: 'Handicrafts',
    slug: 'handicraft',
    description: 'Exquisitely hand-carved pure marble artifacts, spiritual decor, and utility art sculpted by traditional artisans. Bulk and wholesale orders only.',
    image: '/src/assets/images/marble_brass_handicrafts_1790747867183.jpg',
    subcategories: [
      'Marble Diyas',
      'Marble Candle Holders',
      'Marble Decorative Items',
      'Marble Statues',
      'Marble Bowls',
      'Marble Trays',
      'Marble Home Décor',
      'Marble Tables',
      'Other Handicrafts'
    ]
  }
];

export const defaultProducts: Product[] = [];

export const defaultSettings: BusinessSettings = {
  businessName: 'Ramji Banjara Marble L.U',
  tagline: 'Direct Mines & Factory to Your Door — Premium Makrana Marble, Granites & Crafts.',
  logoUrl: '',
  description: 'Ramji Banjara Marble L.U — Direct All India mines manufacturer and wholesale supplier of authentic Makrana white marble, granites, and hand-carved stone handicrafts. Serving architects, builders, retailers, and corporate buyers across all states of India.',
  phone: '+91 8949184186',
  whatsappNumber: '+91 8949184186',
  email: 'govindsinghbanjara142@gmail.com',
  address: 'F470, Phase IV, Rico Industries Area, Tukda Road,',
  city: 'Kishangarh',
  state: 'Rajasthan',
  pincode: '305801',
  instagramId: '@ramji_banjara_marble_l.u',
  facebook: 'https://facebook.com',
  youtube: 'https://youtube.com',
  websiteUrl: 'ramjibanjaramarble.com',
  deliveryInformation: 'We offer reliable, insured pan-India road logistics covering all 28 states and union territories. Stone slabs and blocks are loaded using calibrated gantry cranes with wooden spacers and protective strapping. Handcrafted items are individually wrapped in bubble wrap, thermocol, and wooden-framed corrugated cartons for zero transit breakage.',
  transportInformation: 'Transport charges are separate from product cost and calculated based on order weight, volumetric dimension, and final destination pin code. For bulk marble craft orders, standard surface transport takes 4 to 8 working days. Transport charges are confirmed by our logistics team post enquiry and paid as per logistics booking receipt.',
  termsAndConditions: '1. Marble and granite are natural geological stones; mild natural vein variations and crystal crystallization are hallmarks of authenticity.\n2. Marble Craft and Handicraft items are manufactured strictly for bulk and wholesale distribution with a minimum quantity threshold of 100 pieces.\n3. Orders are dispatched upon clearance of payment. GST invoice is provided upon dispatch where applicable.\n4. Unloading at the delivery site is the responsibility of the consignee unless prior turnkey crane unloading is arranged.\n5. Any transit damage claims must be documented with photos during truck unloading and reported within 24 hours of arrival.',
  privacyPolicy: 'Ramji Banjara Marble L.U respects the privacy of our wholesale clients and retail partners. Contact and business credentials submitted on this portal are strictly utilized for quotation generation, order processing, and logistical coordination. We do not sell or share business information with third-party advertising networks.',
  gstSettings: {
    enabled: false, // Default GST Disabled as requested
    fieldVisibility: 'optional', // Optional on customer form
    gstNumber: '',
    gstBusinessName: '',
    gstAddress: '',
    gstPercentage: 18
  },
  craftDefaultMinQty: 100,
  adminToken: 'admin_session_token_stone_2026'
};

export const defaultOrders: Order[] = [
  {
    id: 'ORD-2026-0891',
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    customer: {
      fullName: 'Vikramaditya Sharma',
      mobile: '+91 98765 43210',
      whatsapp: '+91 98765 43210',
      email: 'vikram@sharmainteriors.in',
      businessName: 'Sharma Interiors & Builders'
    },
    delivery: {
      address: 'Plot 42, Sector 18, Commercial Belt',
      villageArea: 'Near DLF Cyber Hub',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
      landmark: 'Opposite Gateway Tower',
      locationType: 'Commercial Site'
    },
    businessInfo: {
      instagramId: '@sharmainteriors_delhi',
      website: 'www.sharmainteriors.in',
      gstNumber: ''
    },
    items: [
      {
        productId: 'prod-crf-diya-01',
        productName: 'Artisan Carved Makrana White Marble Diya',
        productCode: 'CRF-DYA-WHT-01',
        category: 'Marble Craft',
        unit: 'Piece',
        price: 120,
        pricingType: 'fixed',
        quantity: 250,
        totalPrice: 30000,
        orderRulesNote: 'Wholesale Order (Min 100 pcs rule satisfied)'
      },
      {
        productId: 'prod-brs-gift-02',
        productName: 'Marble + Brass Festive Corporate Gift Box Set (Pair)',
        productCode: 'MB-GFT-BOX-02',
        category: 'Marble + Brass',
        unit: 'Piece',
        price: 690,
        pricingType: 'fixed',
        quantity: 120,
        totalPrice: 82800,
        orderRulesNote: 'Wholesale Order (Min 100 pcs rule satisfied)'
      }
    ],
    totalAmount: 112800,
    transportCharge: 4200,
    transportNote: 'Direct tempo dispatch to Gurugram warehouse',
    status: 'Confirmed',
    adminNotes: 'Client confirmed order via WhatsApp. 50% advance received. Packaging underway.'
  },
  {
    id: 'ORD-2026-0892',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    customer: {
      fullName: 'Rajesh Kulkarni',
      mobile: '+91 94220 87654',
      whatsapp: '+91 94220 87654',
      email: 'rajesh.kulkarni@shristiconstructions.com',
      businessName: 'Shristi Stone Developers'
    },
    delivery: {
      address: 'Bungalow 7, Senapati Bapat Road',
      villageArea: 'Shivajinagar',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411016',
      landmark: 'Near Symbiosis Institute',
      locationType: 'Residential Project'
    },
    businessInfo: {
      instagramId: '',
      website: '',
      gstNumber: ''
    },
    items: [
      {
        productId: 'prod-mkr-white-01',
        productName: 'Makrana Pure White Marble Slabs',
        productCode: 'MKR-WHT-SLB-01',
        category: 'Marble',
        unit: 'Sq. Ft.',
        price: 450,
        pricingType: 'fixed',
        quantity: 650,
        totalPrice: 292500,
        orderRulesNote: 'Marble Flooring Lot (Custom Sq. Ft. Order)'
      }
    ],
    totalAmount: 292500,
    transportCharge: 18500,
    transportNote: '16-ton open truck freight to Pune unloaded by crane',
    status: 'Processing',
    adminNotes: 'High-purity Makrana lot reserved. Inspection video sent to client.'
  }
];
