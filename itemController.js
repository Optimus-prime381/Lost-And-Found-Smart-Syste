const Item = require('../models/Item');

const addItem = async(req, res) => {
    try {
        console.log('Creating item:', req.body);
       const payload = {
           name: req.body.ItemName || req.body.name || req.body.Name || 'Unnamed Item',
           description: req.body.Description || req.body.description || '',
           category: req.body.Category || req.body.category || 'general',
           location: req.body.Location || req.body.location || '',
           image: req.body.image || '',
           status: (req.body.Type || req.body.type || req.body.status || 'lost').toLowerCase(),
           userId: req.body.userId || req.body.userID || req.body.user || undefined
       };

       if (req.body.Name) payload.reporterName = req.body.Name;
       if (req.body.ContactInformation) payload.contactInformation = req.body.ContactInformation;

       const item = await Item.create(payload);
       res.status(201).json(item);
    } catch(error) {
        console.error('Error creating item:', error);
        res.status(500).json({ error: error.message });
    }
}

const getItems = async(req, res) => {
    try {
       const items = await Item.find().sort({ createdAt: -1 });

       const mapped = items.map(it => ({
           _id: it._id,
           Type: it.status,
           ItemName: it.name,
           Name: it.reporterName || '',
           Description: it.description || '',
           Location: it.location || '',
           ContactInformation: it.contactInformation || '',
           Date: it.createdAt,
           image: it.image || ''
       }));

       res.status(200).json(mapped);
    } catch(error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ error: error.message });
    }
}



module.exports = {
    addItem,
    getItems,
};