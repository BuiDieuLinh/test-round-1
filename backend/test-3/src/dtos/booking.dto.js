class CreateBookingDTO {
  constructor(body) {
    this.customerId = body.customer_id;
    this.tableIds = body.table_ids;
    this.bookingTime = body.booking_time;
  }

  static validate(body) {
    const errors = [];
    if (!body.customer_id) errors.push('customer_id is required');
    
    if (!body.table_ids) {
      errors.push('table_ids is required');
    } else if (!Array.isArray(body.table_ids) || body.table_ids.length === 0) {
      errors.push('table_ids must be a non-empty array of uuids');
    } else {
      body.table_ids.forEach((id, index) => {
        if (typeof id !== 'string') {
          errors.push(`table_ids[${index}] must be a string (uuid)`);
        }
      });
    }

    if (!body.booking_time) {
      errors.push('booking_time is required');
    } else if (isNaN(Date.parse(body.booking_time))) {
      errors.push('booking_time must be a valid ISO date string');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = {
  CreateBookingDTO
};
