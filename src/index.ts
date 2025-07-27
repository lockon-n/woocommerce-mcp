#!/usr/bin/env node
import { startMcpServer } from './server.js';

// Check for required environment variables
const requiredEnvVars = [
    'WORDPRESS_SITE_URL',
    'WOOCOMMERCE_CONSUMER_KEY',
    'WOOCOMMERCE_CONSUMER_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('Error: Missing required environment variables:');
    missingEnvVars.forEach(envVar => {
        console.error(`  - ${envVar}`);
    });
    console.error('\nPlease set these environment variables before running the server.');
    process.exit(1);
}

// Optional environment variables check
const optionalEnvVars = ['WORDPRESS_USERNAME', 'WORDPRESS_PASSWORD'];
const missingOptionalEnvVars = optionalEnvVars.filter(envVar => !process.env[envVar]);

if (missingOptionalEnvVars.length > 0) {
    console.warn('Warning: Some optional environment variables are not set:');
    missingOptionalEnvVars.forEach(envVar => {
        console.warn(`  - ${envVar}`);
    });
    console.warn('Some features may be limited.\n');
}

// Start the MCP server
startMcpServer()
    .then(() => {
        console.log('WooCommerce MCP Server started successfully');
    })
    .catch(error => {
        console.error('Failed to start WooCommerce MCP Server:', error);
        process.exit(1);
    });