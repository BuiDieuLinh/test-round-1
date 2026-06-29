const prisma = require('../prisma');

class TableService {
  async getAllTables() {
    return await prisma.restaurantTable.findMany({
      orderBy: { table_number: 'asc' }
    });
  }
}

module.exports = new TableService();
