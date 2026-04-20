const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({})
            .populate('productId', 'name sku')
            .sort({ createdAt: -1 });

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        notification.isRead = true;
        await notification.save();

        res.json(notification);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ isRead: false }, { isRead: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead
};
