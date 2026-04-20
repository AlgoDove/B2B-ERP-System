const Admin = require('../models/Admin');
const SalesStaff = require('../models/SalesStaff');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getMockDatabase } = require('../config/mockDb');

let mockDb = null;

const generateToken = (id, role, username) => {
    return jwt.sign({ id, role, username }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const initMockDb = async () => {
    if (!mockDb) {
        mockDb = await getMockDatabase();
    }
    return mockDb;
};

const findExistingUser = async (username) => {
    try {
        const [admin, staff] = await Promise.all([
            Admin.findOne({ username }),
            SalesStaff.findOne({ username })
        ]);
        return admin || staff;
    } catch (error) {
        // Fallback to mock database
        const db = await initMockDb();
        const admin = await db.findAdminByUsername(username);
        const staff = await db.findSalesStaffByUsername(username);
        return admin || staff;
    }
};

const register = async (req, res) => {
    const { username, password, role } = req.body;

    try {
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        if (String(password).length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const existing = await findExistingUser(username);
        if (existing) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const requestedRole = role === 'admin' ? 'admin' : 'sales_staff';
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        let created;
        try {
            if (requestedRole === 'admin') {
                created = await Admin.create({ username, passwordHash, role: 'admin' });
            } else {
                created = await SalesStaff.create({ username, passwordHash, role: 'sales_staff' });
            }
        } catch (dbError) {
            const db = await initMockDb();
            if (requestedRole === 'admin') {
                created = await db.createAdmin({ username, passwordHash, role: 'admin' });
            } else {
                created = await db.createSalesStaff({ username, passwordHash, role: 'sales_staff' });
            }
        }

        res.status(201).json({
            _id: created._id,
            username: created.username,
            role: created.role,
            createdAt: created.createdAt || null
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check in Admin first
        let user = await Admin.findOne({ username });
        if (!user) {
            // Check in SalesStaff
            user = await SalesStaff.findOne({ username });
        }

        if (user && (await bcrypt.compare(password, user.passwordHash))) {
            res.json({
                _id: user._id,
                username: user.username,
                role: user.role,
                token: generateToken(user._id, user.role, user.username),
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        // Fallback to mock database if MongoDB is unavailable
        try {
            const db = await initMockDb();
            let user = await db.findAdminByUsername(username);
            if (!user) {
                user = await db.findSalesStaffByUsername(username);
            }

            if (user && (await bcrypt.compare(password, user.passwordHash))) {
                res.json({
                    _id: user._id,
                    username: user.username,
                    role: user.role,
                    token: generateToken(user._id, user.role, user.username),
                });
            } else {
                res.status(401).json({ message: 'Invalid username or password' });
            }
        } catch (mockError) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
};

module.exports = { login, register };
