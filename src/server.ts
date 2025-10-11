import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { ProductService } from './services/products.js';
import { OrderService } from './services/orders.js';
import { CustomerService } from './services/customers.js';
import { CouponService } from './services/coupons.js';
import { ShippingService } from './services/shipping.js';
import { TaxService } from './services/tax.js';
import { ReportService } from './services/reports.js';
import { SystemService } from './services/system.js';

export async function startMcpServer() {
    const server = new Server(
        {
            name: 'woocommerce-mcp-server',
            version: '1.0.0',
        },
        {
            capabilities: {
                tools: {},
            },
        }
    );

    // Initialize services
    const productService = new ProductService();
    const orderService = new OrderService();
    const customerService = new CustomerService();
    const couponService = new CouponService();
    const shippingService = new ShippingService();
    const taxService = new TaxService();
    const reportService = new ReportService();
    const systemService = new SystemService();

    // Store tools count for logging
    let toolsCount = 0;

    server.setRequestHandler(ListToolsRequestSchema, async () => {
        const tools = [
            // Product tools
            {
                name: 'woo_products_list',
                description: 'List products with optional filters',
                inputSchema: {
                    type: 'object',
                    properties: {
                        perPage: { type: 'integer', description: 'Number of items per page. Default: 10, Maximum: 100. Use pagination for large datasets.', default: 10, minimum: 1, maximum: 100 },
                        page: { type: 'integer', description: 'Page number for pagination. Default: 1. Increment to get next page of results.', default: 1, minimum: 1 },
                        search: { type: 'string', description: 'Search term' },
                        status: { type: 'string', description: 'Product status', enum: ['publish', 'draft', 'private', 'pending'] },
                        category: { type: 'string', description: 'Category ID' },
                        tag: { type: 'string', description: 'Tag ID' },
                        sku: { type: 'string', description: 'Product SKU' },
                        featured: { type: 'boolean', description: 'Featured products only' },
                        onSale: { type: 'boolean', description: 'On sale products only' },
                        minPrice: { type: 'string', description: 'Minimum price' },
                        maxPrice: { type: 'string', description: 'Maximum price' },
                        stockStatus: { type: 'string', description: 'Stock status', enum: ['instock', 'outofstock', 'onbackorder'] },
                        orderby: { type: 'string', description: 'Order by field', enum: ['date', 'id', 'include', 'title', 'slug', 'price', 'popularity', 'rating'] },
                        order: { type: 'string', description: 'Order direction', enum: ['asc', 'desc'] }
                    }
                }
            },
            {
                name: 'woo_products_get',
                description: 'Get a specific product by ID',
                inputSchema: {
                    type: 'object',
                    properties: {
                        productId: { type: 'integer', description: 'Product ID' }
                    },
                    required: ['productId']
                }
            },
            {
                name: 'woo_products_create',
                description: 'Create a new product',
                inputSchema: {
                    type: 'object',
                    properties: {
                        productData: {
                            type: 'object',
                            description: 'Product data',
                            properties: {
                                name: { type: 'string', description: 'Product name' },
                                type: { type: 'string', description: 'Product type', enum: ['simple', 'grouped', 'external', 'variable'] },
                                status: { type: 'string', description: 'Product status', enum: ['publish', 'draft', 'private', 'pending'] },
                                featured: { type: 'boolean', description: 'Featured product' },
                                catalog_visibility: { type: 'string', description: 'Catalog visibility', enum: ['visible', 'catalog', 'search', 'hidden'] },
                                description: { type: 'string', description: 'Product description' },
                                short_description: { type: 'string', description: 'Product short description' },
                                sku: { type: 'string', description: 'Product SKU' },
                                regular_price: { type: 'string', description: 'Regular price' },
                                sale_price: { type: 'string', description: 'Sale price' },
                                manage_stock: { type: 'boolean', description: 'Manage stock' },
                                stock_quantity: { type: 'integer', description: 'Stock quantity' },
                                categories: {
                                    type: 'array',
                                    description: 'Product categories',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'integer', description: 'Category ID' }
                                        }
                                    }
                                },
                                images: {
                                    type: 'array',
                                    description: 'Product images',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            src: { type: 'string', description: 'Image URL' },
                                            alt: { type: 'string', description: 'Image alt text' }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    required: ['productData']
                }
            },
            {
                name: 'woo_products_update',
                description: 'Update a product',
                inputSchema: {
                    type: 'object',
                    properties: {
                        productId: { type: 'integer', description: 'Product ID' },
                        productData: {
                            type: 'object',
                            description: 'Product data to update',
                            additionalProperties: true
                        }
                    },
                    required: ['productId', 'productData']
                }
            },
            {
                name: 'woo_products_delete',
                description: 'Delete a product',
                inputSchema: {
                    type: 'object',
                    properties: {
                        productId: { type: 'integer', description: 'Product ID' },
                        force: { type: 'boolean', description: 'Force delete', default: false }
                    },
                    required: ['productId']
                }
            },
            {
                name: 'woo_products_batch_update',
                description: 'Batch update products',
                inputSchema: {
                    type: 'object',
                    properties: {
                        create: {
                            type: 'array',
                            description: 'Products to create',
                            items: {
                                type: 'object',
                                additionalProperties: true
                            }
                        },
                        update: {
                            type: 'array',
                            description: 'Products to update',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'integer', description: 'Product ID' }
                                },
                                additionalProperties: true
                            }
                        },
                        delete: {
                            type: 'array',
                            description: 'Product IDs to delete',
                            items: { type: 'integer' }
                        }
                    }
                }
            },
            {
                name: 'woo_products_variations_list',
                description: 'List product variations',
                inputSchema: {
                    type: 'object',
                    properties: {
                        productId: { type: 'integer', description: 'Product ID' },
                        perPage: { type: 'integer', description: 'Number of items per page. Default: 10, Maximum: 100.', default: 10, minimum: 1, maximum: 100 },
                        page: { type: 'integer', description: 'Page number for pagination. Default: 1.', default: 1, minimum: 1 }
                    },
                    required: ['productId']
                }
            },
            {
                name: 'woo_products_categories_list',
                description: 'List product categories',
                inputSchema: {
                    type: 'object',
                    properties: {
                        perPage: { type: 'integer', description: 'Number of items per page. Default: 10, Maximum: 100.', default: 10, minimum: 1, maximum: 100 },
                        page: { type: 'integer', description: 'Page number for pagination. Default: 1.', default: 1, minimum: 1 },
                        search: { type: 'string', description: 'Search term' },
                        parent: { type: 'integer', description: 'Parent category ID' },
                        hideEmpty: { type: 'boolean', description: 'Hide empty categories' }
                    }
                }
            },
            {
                name: 'woo_products_tags_list',
                description: 'List product tags',
                inputSchema: {
                    type: 'object',
                    properties: {
                        perPage: { type: 'integer', description: 'Number of items per page. Default: 10, Maximum: 100.', default: 10, minimum: 1, maximum: 100 },
                        page: { type: 'integer', description: 'Page number for pagination. Default: 1.', default: 1, minimum: 1 },
                        search: { type: 'string', description: 'Search term' },
                        hideEmpty: { type: 'boolean', description: 'Hide empty tags' }
                    }
                }
            },
            {
                name: 'woo_products_reviews_list',
                description: 'List product reviews',
                inputSchema: {
                    type: 'object',
                    properties: {
                        productId: { type: 'integer', description: 'Product ID (optional)' },
                        perPage: { type: 'integer', description: 'Number of items per page. Default: 10, Maximum: 100.', default: 10, minimum: 1, maximum: 100 },
                        page: { type: 'integer', description: 'Page number for pagination. Default: 1.', default: 1, minimum: 1 },
                        status: { type: 'string', description: 'Review status', enum: ['all', 'hold', 'approved', 'spam', 'trash'] }
                    }
                }
            },

            // Order tools
            {
                name: 'woo_orders_list',
                description: 'List orders with optional filters',
                inputSchema: {
                    type: 'object',
                    properties: {
                        perPage: { type: 'integer', description: 'Number of items per page. Default: 10, Maximum: 100.', default: 10, minimum: 1, maximum: 100 },
                        page: { type: 'integer', description: 'Page number for pagination. Default: 1.', default: 1, minimum: 1 },
                        status: {
                            type: 'array',
                            items: { type: 'string', enum: ['pending', 'processing', 'on-hold', 'completed', 'cancelled', 'refunded', 'failed'] },
                            description: 'Order statuses'
                        },
                        customer: { type: 'integer', description: 'Customer ID' },
                        product: { type: 'integer', description: 'Product ID' },
                        dateAfter: { type: 'string', description: 'Orders after this date (ISO 8601)' },
                        dateBefore: { type: 'string', description: 'Orders before this date (ISO 8601)' },
                        orderby: { type: 'string', description: 'Order by field', enum: ['date', 'id', 'include', 'title', 'slug'] },
                        order: { type: 'string', description: 'Order direction', enum: ['asc', 'desc'] }
                    }
                }
            },
            {
                name: 'woo_orders_get',
                description: 'Get a specific order by ID',
                inputSchema: {
                    type: 'object',
                    properties: {
                        orderId: { type: 'integer', description: 'Order ID' }
                    },
                    required: ['orderId']
                }
            },
            {
                name: 'woo_orders_create',
                description: 'Create a new order',
                inputSchema: {
                    type: 'object',
                    properties: {
                        orderData: {
                            type: 'object',
                            description: 'Order data',
                            properties: {
                                payment_method: { type: 'string', description: 'Payment method ID' },
                                payment_method_title: { type: 'string', description: 'Payment method title' },
                                set_paid: { type: 'boolean', description: 'Define if the order is paid' },
                                billing: {
                                    type: 'object',
                                    description: 'Billing address',
                                    additionalProperties: true
                                },
                                shipping: {
                                    type: 'object',
                                    description: 'Shipping address',
                                    additionalProperties: true
                                },
                                line_items: {
                                    type: 'array',
                                    description: 'Line items data',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            product_id: { type: 'integer', description: 'Product ID' },
                                            quantity: { type: 'integer', description: 'Quantity' }
                                        }
                                    }
                                },
                                shipping_lines: {
                                    type: 'array',
                                    description: 'Shipping lines data',
                                    items: {
                                        type: 'object',
                                        additionalProperties: true
                                    }
                                }
                            }
                        }
                    },
                    required: ['orderData']
                }
            },
            {
                name: 'woo_orders_update',
                description: 'Update an order',
                inputSchema: {
                    type: 'object',
                    properties: {
                        orderId: { type: 'integer', description: 'Order ID' },
                        orderData: { 
                            type: 'object', 
                            description: 'Order data to update',
                            additionalProperties: true
                        }
                    },
                    required: ['orderId', 'orderData']
                }
            },
            {
                name: 'woo_orders_delete',
                description: 'Delete an order',
                inputSchema: {
                    type: 'object',
                    properties: {
                        orderId: { type: 'integer', description: 'Order ID' },
                        force: { type: 'boolean', description: 'Force delete', default: false }
                    },
                    required: ['orderId']
                }
            },
            {
                name: 'woo_orders_batch_update',
                description: 'Batch update orders',
                inputSchema: {
                    type: 'object',
                    properties: {
                        create: {
                            type: 'array',
                            description: 'Orders to create',
                            items: {
                                type: 'object',
                                additionalProperties: true
                            }
                        },
                        update: {
                            type: 'array',
                            description: 'Orders to update',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'integer', description: 'Order ID' }
                                },
                                additionalProperties: true
                            }
                        },
                        delete: {
                            type: 'array',
                            description: 'Order IDs to delete',
                            items: { type: 'integer' }
                        }
                    }
                }
            },
            {
                name: 'woo_orders_notes_create',
                description: 'Add a note to an order',
                inputSchema: {
                    type: 'object',
                    properties: {
                        orderId: { type: 'integer', description: 'Order ID' },
                        note: { type: 'string', description: 'Note content' },
                        customerNote: { type: 'boolean', description: 'Is customer note', default: false }
                    },
                    required: ['orderId', 'note']
                }
            },
            {
                name: 'woo_orders_refunds_create',
                description: 'Create a refund for an order',
                inputSchema: {
                    type: 'object',
                    properties: {
                        orderId: { type: 'integer', description: 'Order ID' },
                        amount: { type: 'string', description: 'Refund amount' },
                        reason: { type: 'string', description: 'Refund reason' },
                        refundPayment: { type: 'boolean', description: 'Refund payment', default: false },
                        lineItems: {
                            type: 'array',
                            description: 'Line items to refund',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'integer', description: 'Line item ID' },
                                    refund_total: { type: 'number', description: 'Amount to refund' },
                                    refund_tax: {
                                        type: 'array',
                                        description: 'Tax to refund',
                                        items: {
                                            type: 'object',
                                            additionalProperties: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    required: ['orderId']
                }
            },

            // Customer tools
            {
                name: 'woo_customers_list',
                description: 'List customers with optional filters',
                inputSchema: {
                    type: 'object',
                    properties: {
                        perPage: { type: 'integer', description: 'Number of items per page. Default: 10, Maximum: 100.', default: 10, minimum: 1, maximum: 100 },
                        page: { type: 'integer', description: 'Page number for pagination. Default: 1.', default: 1, minimum: 1 },
                        search: { type: 'string', description: 'Search term' },
                        email: { type: 'string', description: 'Customer email' },
                        role: { type: 'string', description: 'Customer role', enum: ['all', 'customer', 'administrator', 'shop_manager'] },
                        orderby: { type: 'string', description: 'Order by field', enum: ['id', 'include', 'name', 'registered_date'] },
                        order: { type: 'string', description: 'Order direction', enum: ['asc', 'desc'] }
                    }
                }
            },
            {
                name: 'woo_customers_get',
                description: 'Get a specific customer by ID',
                inputSchema: {
                    type: 'object',
                    properties: {
                        customerId: { type: 'integer', description: 'Customer ID' }
                    },
                    required: ['customerId']
                }
            },
            {
                name: 'woo_customers_create',
                description: 'Create a new customer',
                inputSchema: {
                    type: 'object',
                    properties: {
                        customerData: {
                            type: 'object',
                            description: 'Customer data',
                            properties: {
                                email: { type: 'string', description: 'Customer email' },
                                first_name: { type: 'string', description: 'First name' },
                                last_name: { type: 'string', description: 'Last name' },
                                username: { type: 'string', description: 'Username' },
                                password: { type: 'string', description: 'Password' },
                                billing: {
                                    type: 'object',
                                    description: 'Billing address',
                                    additionalProperties: true
                                },
                                shipping: {
                                    type: 'object',
                                    description: 'Shipping address',
                                    additionalProperties: true
                                },
                                meta_data: {
                                    type: 'array',
                                    description: 'Meta data',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            key: { type: 'string' },
                                            value: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    required: ['customerData']
                }
            },
            {
                name: 'woo_customers_update',
                description: 'Update a customer',
                inputSchema: {
                    type: 'object',
                    properties: {
                        customerId: { type: 'integer', description: 'Customer ID' },
                        customerData: {
                            type: 'object',
                            description: 'Customer data to update',
                            additionalProperties: true
                        }
                    },
                    required: ['customerId', 'customerData']
                }
            },

            // Coupon tools
            {
                name: 'woo_coupons_list',
                description: 'List coupons with optional filters',
                inputSchema: {
                    type: 'object',
                    properties: {
                        perPage: { type: 'integer', description: 'Number of items per page. Default: 10, Maximum: 100.', default: 10, minimum: 1, maximum: 100 },
                        page: { type: 'integer', description: 'Page number for pagination. Default: 1.', default: 1, minimum: 1 },
                        search: { type: 'string', description: 'Search term' },
                        code: { type: 'string', description: 'Coupon code' }
                    }
                }
            },
            {
                name: 'woo_coupons_get',
                description: 'Get a specific coupon by ID',
                inputSchema: {
                    type: 'object',
                    properties: {
                        couponId: { type: 'integer', description: 'Coupon ID' }
                    },
                    required: ['couponId']
                }
            },
            {
                name: 'woo_coupons_create',
                description: 'Create a new coupon',
                inputSchema: {
                    type: 'object',
                    properties: {
                        couponData: {
                            type: 'object',
                            description: 'Coupon data',
                            properties: {
                                code: { type: 'string', description: 'Coupon code' },
                                discount_type: { type: 'string', description: 'Discount type', enum: ['percent', 'fixed_cart', 'fixed_product'] },
                                amount: { type: 'string', description: 'Discount amount' },
                                date_expires: { type: 'string', description: 'Expiry date (ISO 8601)', nullable: true },
                                individual_use: { type: 'boolean', description: 'Individual use only' },
                                product_ids: {
                                    type: 'array',
                                    description: 'Product IDs',
                                    items: { type: 'integer' }
                                },
                                excluded_product_ids: {
                                    type: 'array',
                                    description: 'Excluded product IDs',
                                    items: { type: 'integer' }
                                },
                                usage_limit: { type: 'integer', description: 'Usage limit per coupon', nullable: true },
                                usage_limit_per_user: { type: 'integer', description: 'Usage limit per user', nullable: true },
                                limit_usage_to_x_items: { type: 'integer', description: 'Limit usage to X items', nullable: true },
                                free_shipping: { type: 'boolean', description: 'Allow free shipping' },
                                exclude_sale_items: { type: 'boolean', description: 'Exclude sale items' },
                                minimum_amount: { type: 'string', description: 'Minimum spend' },
                                maximum_amount: { type: 'string', description: 'Maximum spend' }
                            },
                            required: ['code', 'discount_type', 'amount']
                        }
                    },
                    required: ['couponData']
                }
            },
            {
                name: 'woo_coupons_update',
                description: 'Update a coupon',
                inputSchema: {
                    type: 'object',
                    properties: {
                        couponId: { type: 'integer', description: 'Coupon ID' },
                        couponData: {
                            type: 'object',
                            description: 'Coupon data to update',
                            additionalProperties: true
                        }
                    },
                    required: ['couponId', 'couponData']
                }
            },
            {
                name: 'woo_coupons_delete',
                description: 'Delete a coupon',
                inputSchema: {
                    type: 'object',
                    properties: {
                        couponId: { type: 'integer', description: 'Coupon ID' },
                        force: { type: 'boolean', description: 'Force delete', default: true }
                    },
                    required: ['couponId']
                }
            },

            // Report tools
            {
                name: 'woo_reports_sales',
                description: 'Get sales report',
                inputSchema: {
                    type: 'object',
                    properties: {
                        period: { type: 'string', description: 'Report period', enum: ['week', 'month', 'last_month', 'year'] },
                        dateMin: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
                        dateMax: { type: 'string', description: 'End date (YYYY-MM-DD)' }
                    }
                }
            },
            {
                name: 'woo_reports_top_sellers',
                description: 'Get top sellers report',
                inputSchema: {
                    type: 'object',
                    properties: {
                        period: { type: 'string', description: 'Report period', enum: ['week', 'month', 'last_month', 'year'] },
                        dateMin: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
                        dateMax: { type: 'string', description: 'End date (YYYY-MM-DD)' },
                        perPage: { type: 'integer', description: 'Number of items per page. Default: 10, Maximum: 100.', default: 10, minimum: 1, maximum: 100 },
                        page: { type: 'integer', description: 'Page number for pagination. Default: 1.', default: 1, minimum: 1 }
                    }
                }
            },
            {
                name: 'woo_reports_customers',
                description: 'Get customers report',
                inputSchema: {
                    type: 'object',
                    properties: {
                        period: { type: 'string', description: 'Report period', enum: ['week', 'month', 'last_month', 'year'] },
                        dateMin: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
                        dateMax: { type: 'string', description: 'End date (YYYY-MM-DD)' }
                    }
                }
            },
            {
                name: 'woo_reports_orders',
                description: 'Get orders report',
                inputSchema: {
                    type: 'object',
                    properties: {
                        period: { type: 'string', description: 'Report period', enum: ['week', 'month', 'last_month', 'year'] },
                        dateMin: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
                        dateMax: { type: 'string', description: 'End date (YYYY-MM-DD)' }
                    }
                }
            },
            {
                name: 'woo_reports_products',
                description: 'Get products report',
                inputSchema: {
                    type: 'object',
                    properties: {
                        period: { type: 'string', description: 'Report period', enum: ['week', 'month', 'last_month', 'year'] },
                        dateMin: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
                        dateMax: { type: 'string', description: 'End date (YYYY-MM-DD)' },
                        perPage: { type: 'integer', description: 'Number of items per page. Default: 10, Maximum: 100.', default: 10, minimum: 1, maximum: 100 },
                        page: { type: 'integer', description: 'Page number for pagination. Default: 1.', default: 1, minimum: 1 }
                    }
                }
            },
            {
                name: 'woo_reports_stock',
                description: 'Get stock report',
                inputSchema: {
                    type: 'object',
                    properties: {
                        perPage: { type: 'integer', description: 'Number of items per page. Default: 10, Maximum: 100.', default: 10, minimum: 1, maximum: 100 },
                        page: { type: 'integer', description: 'Page number for pagination. Default: 1.', default: 1, minimum: 1 }
                    }
                }
            },
            {
                name: 'woo_reports_low_stock',
                description: 'Get low stock report',
                inputSchema: {
                    type: 'object',
                    properties: {
                        perPage: { type: 'integer', description: 'Number of items per page. Default: 10, Maximum: 100.', default: 10, minimum: 1, maximum: 100 },
                        page: { type: 'integer', description: 'Page number for pagination. Default: 1.', default: 1, minimum: 1 }
                    }
                }
            },

            // Shipping tools
            {
                name: 'woo_shipping_zones_list',
                description: 'List shipping zones',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'woo_shipping_zones_get',
                description: 'Get a shipping zone',
                inputSchema: {
                    type: 'object',
                    properties: {
                        zoneId: { type: 'integer', description: 'Zone ID' }
                    },
                    required: ['zoneId']
                }
            },
            {
                name: 'woo_shipping_zones_create',
                description: 'Create a shipping zone',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', description: 'Zone name' },
                        order: { type: 'integer', description: 'Zone order' }
                    },
                    required: ['name']
                }
            },
            {
                name: 'woo_shipping_zones_update',
                description: 'Update a shipping zone',
                inputSchema: {
                    type: 'object',
                    properties: {
                        zoneId: { type: 'integer', description: 'Zone ID' },
                        name: { type: 'string', description: 'Zone name' },
                        order: { type: 'integer', description: 'Zone order' }
                    },
                    required: ['zoneId']
                }
            },
            {
                name: 'woo_shipping_zone_methods_list',
                description: 'List methods for a shipping zone',
                inputSchema: {
                    type: 'object',
                    properties: {
                        zoneId: { type: 'integer', description: 'Zone ID' }
                    },
                    required: ['zoneId']
                }
            },
            {
                name: 'woo_shipping_zone_methods_create',
                description: 'Add a method to a shipping zone',
                inputSchema: {
                    type: 'object',
                    properties: {
                        zoneId: { type: 'integer', description: 'Zone ID' },
                        methodId: { type: 'string', description: 'Method ID' },
                        enabled: { type: 'boolean', description: 'Is enabled', default: true },
                        settings: { 
                            type: 'object', 
                            description: 'Method settings',
                            additionalProperties: true
                        }
                    },
                    required: ['zoneId', 'methodId']
                }
            },

            // Tax tools
            {
                name: 'woo_tax_rates_list',
                description: 'List tax rates',
                inputSchema: {
                    type: 'object',
                    properties: {
                        taxClass: { type: 'string', description: 'Tax class' },
                        perPage: { type: 'integer', description: 'Number of items per page. Default: 10, Maximum: 100.', default: 10, minimum: 1, maximum: 100 },
                        page: { type: 'integer', description: 'Page number for pagination. Default: 1.', default: 1, minimum: 1 }
                    }
                }
            },
            {
                name: 'woo_tax_rates_get',
                description: 'Get a tax rate',
                inputSchema: {
                    type: 'object',
                    properties: {
                        rateId: { type: 'integer', description: 'Tax rate ID' }
                    },
                    required: ['rateId']
                }
            },
            {
                name: 'woo_tax_rates_create',
                description: 'Create a tax rate',
                inputSchema: {
                    type: 'object',
                    properties: {
                        country: { type: 'string', description: 'Country code' },
                        state: { type: 'string', description: 'State code' },
                        rate: { type: 'string', description: 'Tax rate' },
                        name: { type: 'string', description: 'Tax name' },
                        priority: { type: 'integer', description: 'Priority', default: 1 },
                        compound: { type: 'boolean', description: 'Is compound', default: false },
                        shipping: { type: 'boolean', description: 'Apply to shipping', default: true },
                        class: { type: 'string', description: 'Tax class', default: 'standard' }
                    },
                    required: ['country', 'rate']
                }
            },
            {
                name: 'woo_tax_classes_list',
                description: 'List tax classes',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },

            // System tools
            {
                name: 'woo_system_status',
                description: 'Get system status information',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'woo_system_tools_list',
                description: 'List system tools',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'woo_system_tools_run',
                description: 'Run a system tool',
                inputSchema: {
                    type: 'object',
                    properties: {
                        toolId: { 
                            type: 'string', 
                            description: 'Tool ID',
                            enum: ['clear_transients', 'clear_expired_transients', 'clear_orphaned_variations', 'add_order_indexes', 'recount_terms', 'reset_roles', 'clear_sessions', 'clear_template_cache', 'clear_system_status_theme_info_cache']
                        }
                    },
                    required: ['toolId']
                }
            },
            {
                name: 'woo_settings_list',
                description: 'List settings groups',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'woo_settings_get',
                description: 'Get settings for a group',
                inputSchema: {
                    type: 'object',
                    properties: {
                        groupId: { 
                            type: 'string', 
                            description: 'Settings group ID',
                            enum: ['general', 'products', 'tax', 'shipping', 'checkout', 'account', 'email', 'integration', 'advanced', 'rest-api']
                        }
                    },
                    required: ['groupId']
                }
            },
            {
                name: 'woo_payment_gateways_list',
                description: 'List payment gateways',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'woo_payment_gateways_get',
                description: 'Get a payment gateway',
                inputSchema: {
                    type: 'object',
                    properties: {
                        gatewayId: { type: 'string', description: 'Gateway ID' }
                    },
                    required: ['gatewayId']
                }
            },
            {
                name: 'woo_payment_gateways_update',
                description: 'Update a payment gateway',
                inputSchema: {
                    type: 'object',
                    properties: {
                        gatewayId: { type: 'string', description: 'Gateway ID' },
                        enabled: { type: 'boolean', description: 'Is enabled' },
                        title: { type: 'string', description: 'Gateway title' },
                        description: { type: 'string', description: 'Gateway description' },
                        settings: { 
                            type: 'object', 
                            description: 'Gateway settings',
                            additionalProperties: true
                        }
                    },
                    required: ['gatewayId']
                }
            },
            {
                name: 'woo_webhooks_list',
                description: 'List webhooks',
                inputSchema: {
                    type: 'object',
                    properties: {
                        perPage: { type: 'integer', description: 'Number of items per page. Default: 10, Maximum: 100.', default: 10, minimum: 1, maximum: 100 },
                        page: { type: 'integer', description: 'Page number for pagination. Default: 1.', default: 1, minimum: 1 },
                        status: { type: 'string', description: 'Webhook status', enum: ['active', 'paused', 'disabled'] }
                    }
                }
            },
            {
                name: 'woo_webhooks_create',
                description: 'Create a webhook',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', description: 'Webhook name' },
                        topic: { 
                            type: 'string', 
                            description: 'Webhook topic',
                            enum: ['coupon.created', 'coupon.updated', 'coupon.deleted', 'customer.created', 'customer.updated', 'customer.deleted', 'order.created', 'order.updated', 'order.deleted', 'product.created', 'product.updated', 'product.deleted']
                        },
                        delivery_url: { type: 'string', description: 'Delivery URL' },
                        status: { type: 'string', description: 'Webhook status', enum: ['active', 'paused', 'disabled'], default: 'active' },
                        secret: { type: 'string', description: 'Secret key' }
                    },
                    required: ['name', 'topic', 'delivery_url']
                }
            }
        ];
        
        toolsCount = tools.length;
        
        return { tools };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args = {} } = request.params;

        try {
            let result: any;

            switch (name) {
                // Product tools
                case 'woo_products_list':
                    result = await productService.listProducts(args as any);
                    break;
                case 'woo_products_get':
                    result = await productService.getProduct(args as any);
                    break;
                case 'woo_products_create':
                    result = await productService.createProduct(args as any);
                    break;
                case 'woo_products_update':
                    result = await productService.updateProduct(args as any);
                    break;
                case 'woo_products_delete':
                    result = await productService.deleteProduct(args as any);
                    break;
                case 'woo_products_batch_update':
                    result = await productService.batchUpdateProducts(args as any);
                    break;
                case 'woo_products_variations_list':
                    result = await productService.listVariations(args as any);
                    break;
                case 'woo_products_categories_list':
                    result = await productService.listCategories(args as any);
                    break;
                case 'woo_products_tags_list':
                    result = await productService.listTags(args as any);
                    break;
                case 'woo_products_reviews_list':
                    result = await productService.listReviews(args as any);
                    break;

                // Order tools
                case 'woo_orders_list':
                    result = await orderService.listOrders(args as any);
                    break;
                case 'woo_orders_get':
                    result = await orderService.getOrder(args as any);
                    break;
                case 'woo_orders_create':
                    result = await orderService.createOrder(args as any);
                    break;
                case 'woo_orders_update':
                    result = await orderService.updateOrder(args as any);
                    break;
                case 'woo_orders_delete':
                    result = await orderService.deleteOrder(args as any);
                    break;
                case 'woo_orders_batch_update':
                    result = await orderService.batchUpdateOrders(args as any);
                    break;
                case 'woo_orders_notes_create':
                    const noteArgs = args as any;
                    result = await orderService.createOrderNote(noteArgs.orderId, {
                        note: noteArgs.note,
                        customer_note: noteArgs.customerNote || false
                    });
                    break;
                case 'woo_orders_refunds_create':
                    const refundArgs = args as any;
                    result = await orderService.createRefund(refundArgs.orderId, {
                        amount: refundArgs.amount,
                        reason: refundArgs.reason,
                        refunded_by: refundArgs.refundedBy,
                        meta_data: refundArgs.metaData,
                        line_items: refundArgs.lineItems,
                        api_refund: refundArgs.refundPayment || false
                    });
                    break;

                // Customer tools
                case 'woo_customers_list':
                    result = await customerService.listCustomers(args as any);
                    break;
                case 'woo_customers_get':
                    result = await customerService.getCustomer(args as any);
                    break;
                case 'woo_customers_create':
                    result = await customerService.createCustomer(args as any);
                    break;
                case 'woo_customers_update':
                    result = await customerService.updateCustomer(args as any);
                    break;

                // Coupon tools
                case 'woo_coupons_list':
                    result = await couponService.listCoupons(args as any);
                    break;
                case 'woo_coupons_get':
                    result = await couponService.getCoupon(args as any);
                    break;
                case 'woo_coupons_create':
                    result = await couponService.createCoupon(args as any);
                    break;
                case 'woo_coupons_update':
                    result = await couponService.updateCoupon(args as any);
                    break;
                case 'woo_coupons_delete':
                    result = await couponService.deleteCoupon(args as any);
                    break;

                // Report tools
                case 'woo_reports_sales':
                    result = await reportService.getSalesReport(args as any);
                    break;
                case 'woo_reports_top_sellers':
                    result = await reportService.getTopSellersReport(args as any);
                    break;
                case 'woo_reports_customers':
                    result = await reportService.getCustomersReport(args as any);
                    break;
                case 'woo_reports_orders':
                    result = await reportService.getOrdersReport(args as any);
                    break;
                case 'woo_reports_products':
                    result = await reportService.getProductsReport(args as any);
                    break;
                case 'woo_reports_stock':
                    result = await reportService.getStockReport(args as any);
                    break;
                case 'woo_reports_low_stock':
                    result = await reportService.getLowStockReport(args as any);
                    break;

                // Shipping tools
                case 'woo_shipping_zones_list':
                    result = await shippingService.listShippingZones();
                    break;
                case 'woo_shipping_zones_get':
                    result = await shippingService.getShippingZone(args as any);
                    break;
                case 'woo_shipping_zones_create':
                    result = await shippingService.createShippingZone(args as any);
                    break;
                case 'woo_shipping_zones_update':
                    const zoneUpdateArgs = args as any;
                    result = await shippingService.updateShippingZone(zoneUpdateArgs.zoneId, zoneUpdateArgs);
                    break;
                case 'woo_shipping_zone_methods_list':
                    result = await shippingService.listShippingZoneMethods(args as any);
                    break;
                case 'woo_shipping_zone_methods_create':
                    const methodCreateArgs = args as any;
                    result = await shippingService.createShippingZoneMethod({
                        zoneId: methodCreateArgs.zoneId,
                        methodData: {
                            method_id: methodCreateArgs.methodId,
                            enabled: methodCreateArgs.enabled,
                            settings: methodCreateArgs.settings
                        }
                    });
                    break;

                // Tax tools
                case 'woo_tax_rates_list':
                    result = await taxService.listTaxRates(args as any);
                    break;
                case 'woo_tax_rates_get':
                    result = await taxService.getTaxRate(args as any);
                    break;
                case 'woo_tax_rates_create':
                    result = await taxService.createTaxRate(args as any);
                    break;
                case 'woo_tax_classes_list':
                    result = await taxService.listTaxClasses();
                    break;

                // System tools
                case 'woo_system_status':
                    result = await systemService.getSystemStatus();
                    break;
                case 'woo_system_tools_list':
                    result = await systemService.listSystemStatusTools();
                    break;
                case 'woo_system_tools_run':
                    const toolArgs = args as any;
                    result = await systemService.runSystemStatusTool(toolArgs.toolId);
                    break;
                case 'woo_settings_list':
                    result = await systemService.listSettings();
                    break;
                case 'woo_settings_get':
                    const settingsArgs = args as any;
                    result = await systemService.getSettingsGroup(settingsArgs.groupId);
                    break;
                case 'woo_payment_gateways_list':
                    result = await systemService.listPaymentGateways();
                    break;
                    case 'woo_payment_gateways_get':
                        const gatewayGetArgs = args as any;
                        result = await systemService.getPaymentGateway(gatewayGetArgs.gatewayId);
                        break;
                    case 'woo_payment_gateways_update':
                        const gatewayUpdateArgs = args as any;
                        result = await systemService.updatePaymentGateway(gatewayUpdateArgs.gatewayId, gatewayUpdateArgs);
                        break;
                    case 'woo_webhooks_list':
                        result = await systemService.listWebhooks(args as any);
                        break;
                    case 'woo_webhooks_create':
                        result = await systemService.createWebhook(args as any);
                        break;
    
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
    
                return {
                    content: [{
                        type: 'text',
                        text: JSON.stringify(result, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: 'text',
                        text: `Error: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        });
    
        // Create transport and connect
        const transport = new StdioServerTransport();
        await server.connect(transport);
        
        // Log the server info
        console.log(`WooCommerce MCP Server v1.0.0 started successfully`);
        console.log(`Connected to: ${process.env.WORDPRESS_SITE_URL}`);
        console.log(`Available tools: ${toolsCount}`);
        
        return server;
    }