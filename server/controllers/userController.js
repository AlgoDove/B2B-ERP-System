const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const SalesStaff = require('../models/SalesStaff');

const isDbReady = () => mongoose.connection.readyState === 1;

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
        if (!isDbReady()) {
            return res.json([]);
        }

        const [admins, staff] = await Promise.all([
            Admin.find({}).select('username role createdAt').lean(),
            SalesStaff.find({}).select('username role createdAt').lean()
        ]);

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
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUsers };
