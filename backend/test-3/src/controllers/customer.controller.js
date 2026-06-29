const customerService = require('../services/customer.service');

class CustomerController {
  async getAll(req, res) {
    try {
      const customers = await customerService.getAllCustomers();
      res.json(customers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = new CustomerController();
