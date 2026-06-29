const prisma = require('../prisma');

class CustomerService {
  async getAllCustomers() {
    return await prisma.customer.findMany({
      orderBy: { full_name: 'asc' }
    });
  }
}

module.exports = new CustomerService();
