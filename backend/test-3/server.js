const app = require('./src/app');
const { startScheduler } = require('./src/schedulers/booking-cancel.scheduler');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

startScheduler();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
