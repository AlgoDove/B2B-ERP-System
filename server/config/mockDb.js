const bcrypt = require('bcryptjs');

// In-memory mock database for offline development
class MockDatabase {
    constructor() {
        this.admins = new Map();
        this.salesStaff = new Map();
        this.customers = new Map();
        this.products = new Map();
        this.suppliers = new Map();
        this.invoices = new Map();
        this.notifications = new Map();
        this.segmentThresholds = new Map();
        this.nextId = {
            admin: 1,
            sales: 1,
            customer: 1,
            product: 1,
            supplier: 1,
            invoice: 1,
            notification: 1
        };
        this.initializeTestData();
    }

    async initializeTestData() {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('password123', salt);

        // Add test admin user
        this.admins.set('admin', {
            _id: 'admin-1',
            username: 'admin',
            passwordHash,
            role: 'admin',
            createdAt: new Date()
        });

        // Add test sales staff user
        this.salesStaff.set('sales', {
            _id: 'sales-1',
            username: 'sales',
            passwordHash,
            role: 'sales_staff',
            createdAt: new Date()
        });

        // Initialize segment thresholds
        this.segmentThresholds.set('normal', {
            segmentName: 'Normal',
            minPurchase: 0,
            maxPurchase: 99999,
            baseDiscount: 0,
            incrementPerAmount: 0,
            incrementUnit: 0
        });
        this.segmentThresholds.set('gold', {
            segmentName: 'Gold',
            minPurchase: 100000,
            maxPurchase: 999999,
            baseDiscount: 4,
            incrementPerAmount: 0.5,
            incrementUnit: 100000
        });
        this.segmentThresholds.set('platinum', {
            segmentName: 'Platinum',
            minPurchase: 1000000,
            maxPurchase: null,
            baseDiscount: 7,
            incrementPerAmount: 1,
            incrementUnit: 100000
        });
    }

    // Admin methods
    async findAdminByUsername(username) {
        return this.admins.get(username) || null;
    }

    async createAdmin(data) {
        const id = `admin-${this.nextId.admin++}`;
        const admin = { _id: id, ...data, createdAt: new Date() };
        this.admins.set(data.username, admin);
        return admin;
    }

    // Sales Staff methods
    async findSalesStaffByUsername(username) {
        return this.salesStaff.get(username) || null;
    }

    async createSalesStaff(data) {
        const id = `sales-${this.nextId.sales++}`;
        const staff = { _id: id, ...data, createdAt: new Date() };
        this.salesStaff.set(data.username, staff);
        return staff;
    }

    async listAdmins() {
        return Array.from(this.admins.values());
    }

    async listSalesStaff() {
        return Array.from(this.salesStaff.values());
    }

    // Customer methods
    async findAllCustomers() {
        return Array.from(this.customers.values());
    }

    async findCustomerById(id) {
        return this.customers.get(id) || null;
    }

    async createCustomer(data) {
        const id = `customer-${this.nextId.customer++}`;
        const customer = { _id: id, ...data, createdAt: new Date() };
        this.customers.set(id, customer);
        return customer;
    }

    async updateCustomer(id, data) {
        const customer = this.customers.get(id);
        if (!customer) return null;
        const updated = { ...customer, ...data };
        this.customers.set(id, updated);
        return updated;
    }

    async deleteCustomer(id) {
        return this.customers.delete(id);
    }

    // Product methods
    async findAllProducts() {
        return Array.from(this.products.values());
    }

    async findProductById(id) {
        return this.products.get(id) || null;
    }

    async createProduct(data) {
        const id = `product-${this.nextId.product++}`;
        const product = { _id: id, ...data, createdAt: new Date() };
        this.products.set(id, product);
        return product;
    }

    async updateProduct(id, data) {
        const product = this.products.get(id);
        if (!product) return null;
        const updated = { ...product, ...data };
        this.products.set(id, updated);
        return updated;
    }

    async deleteProduct(id) {
        return this.products.delete(id);
    }

    // Supplier methods
    async findAllSuppliers() {
        return Array.from(this.suppliers.values());
    }

    async findSupplierById(id) {
        return this.suppliers.get(id) || null;
    }

    async createSupplier(data) {
        const id = `supplier-${this.nextId.supplier++}`;
        const supplier = { _id: id, ...data, createdAt: new Date() };
        this.suppliers.set(id, supplier);
        return supplier;
    }

    async updateSupplier(id, data) {
        const supplier = this.suppliers.get(id);
        if (!supplier) return null;
        const updated = { ...supplier, ...data };
        this.suppliers.set(id, updated);
        return updated;
    }

    async deleteSupplier(id) {
        return this.suppliers.delete(id);
    }

    // Invoice methods
    async findAllInvoices() {
        return Array.from(this.invoices.values());
    }

    async findInvoiceById(id) {
        return this.invoices.get(id) || null;
    }

    async createInvoice(data) {
        const id = `invoice-${this.nextId.invoice++}`;
        const invoice = { _id: id, ...data, createdAt: new Date() };
        this.invoices.set(id, invoice);
        return invoice;
    }

    async updateInvoice(id, data) {
        const invoice = this.invoices.get(id);
        if (!invoice) return null;
        const updated = { ...invoice, ...data };
        this.invoices.set(id, updated);
        return updated;
    }

    // Notification methods
    async findAllNotifications() {
        return Array.from(this.notifications.values());
    }

    async createNotification(data) {
        const id = `notification-${this.nextId.notification++}`;
        const notification = { _id: id, ...data, createdAt: new Date() };
        this.notifications.set(id, notification);
        return notification;
    }
}

// Create singleton instance
let mockDbInstance = null;

const getMockDatabase = async () => {
    if (!mockDbInstance) {
        mockDbInstance = new MockDatabase();
        await mockDbInstance.initializeTestData();
    }
    return mockDbInstance;
};

module.exports = { getMockDatabase };
