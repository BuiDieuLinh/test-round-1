const tableService = require('../services/table.service');

class TableController {
  async getAll(req, res) {
    try {
      const tables = await tableService.getAllTables();
      res.json(tables);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = new TableController();
