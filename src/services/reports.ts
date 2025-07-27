import { BaseService } from './base.js';
import { ReportParams } from '../types.js';

export class ReportService extends BaseService {
    async getSalesReport(params: ReportParams) {
        return this.handleRequest(
            this.client.get('/reports/sales', { params })
        );
    }

    async getTopSellersReport(params: ReportParams) {
        return this.handleRequest(
            this.client.get('/reports/top_sellers', { params })
        );
    }

    async getCouponsReport(params: ReportParams) {
        return this.handleRequest(
            this.client.get('/reports/coupons/totals', { params })
        );
    }

    async getCustomersReport(params: ReportParams) {
        return this.handleRequest(
            this.client.get('/reports/customers/totals', { params })
        );
    }

    async getOrdersReport(params: ReportParams) {
        return this.handleRequest(
            this.client.get('/reports/orders/totals', { params })
        );
    }

    async getProductsReport(params: ReportParams) {
        return this.handleRequest(
            this.client.get('/reports/products/totals', { params })
        );
    }

    async getReviewsReport(params: ReportParams) {
        return this.handleRequest(
            this.client.get('/reports/reviews/totals', { params })
        );
    }

    async getStockReport(params: ReportParams) {
        return this.handleRequest(
            this.client.get('/reports/stock', { params })
        );
    }

    async getLowStockReport(params: ReportParams) {
        return this.handleRequest(
            this.client.get('/reports/stock/low', { params })
        );
    }
}