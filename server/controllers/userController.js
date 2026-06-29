const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const SalesStaff = require('../models/SalesStaff');
const { getMockDatabase } = require('../config/mockDb');

let mockDb = null;

const isDbReady = () => mongoose.connection.readyState === 1;

const initMockDb = async () => {
    if (!mockDb) {
        mockDb = await getMockDatabase();
    }
    return mockDb;
};

const toUserDto = (record, source) => ({
    _id: record._id,
    username: record.username,
    role: record.role,
    source,
    createdAt: record.createdAt || (record._id && typeof record._id.getTimestamp === 'function'
        ? record._id.getTimestamp()
        : null)
});

const getUsers = async (req, res) => {
    try {
        let admins = [];
        let staff = [];

        if (isDbReady()) {
            [admins, staff] = await Promise.all([
                Admin.find({}).select('username role createdAt').lean(),
                SalesStaff.find({}).select('username role createdAt').lean()
            ]);
        } else {
            const db = await initMockDb();
            [admins, staff] = await Promise.all([db.listAdmins(), db.listSalesStaff()]);
        }

        const users = [
            ...admins.map((u) => toUserDto(u, 'admin_collection')),
            ...staff.map((u) => toUserDto(u, 'sales_collection'))
        ].sort((a, b) => {
            const first = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const second = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return second - first;
        });

        res.json(users);
    } catch (error) {
        try {
            const db = await initMockDb();
            const [admins, staff] = await Promise.all([db.listAdmins(), db.listSalesStaff()]);
            const users = [
                ...admins.map((u) => toUserDto(u, 'admin_collection')),
                ...staff.map((u) => toUserDto(u, 'sales_collection'))
            ].sort((a, b) => {
                const first = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const second = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return second - first;
            });
            res.json(users);
        } catch (fallbackError) {
            res.status(500).json({ message: fallbackError.message });
        }
    }
};

module.exports = { getUsers };
