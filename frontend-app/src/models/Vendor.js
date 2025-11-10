// Vendor data model
export class Vendor {
  constructor({
    id = '',
    name = '',
    contactPerson = '',
    phone = '',
    email = '',
    address = '',
    totalCredit = 0, // Total amount owed to this vendor
    totalPaid = 0, // Total amount paid to this vendor
    createdAt = new Date().toISOString()
  } = {}) {
    this.id = id;
    this.name = name;
    this.contactPerson = contactPerson;
    this.phone = phone;
    this.email = email;
    this.address = address;
    this.totalCredit = totalCredit;
    this.totalPaid = totalPaid;
    this.createdAt = createdAt;
  }
}

// Vendor transaction data model
export class VendorTransaction {
  constructor({
    id = '',
    vendorId = '',
    expenseId = '',
    type = '', // 'credit' or 'payment'
    amount = 0,
    description = '',
    date = new Date().toISOString(),
    balanceAfter = 0 // Running balance after this transaction
  } = {}) {
    this.id = id;
    this.vendorId = vendorId;
    this.expenseId = expenseId;
    this.type = type;
    this.amount = amount;
    this.description = description;
    this.date = date;
    this.balanceAfter = balanceAfter;
  }
}