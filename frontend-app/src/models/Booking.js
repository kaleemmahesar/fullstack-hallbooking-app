// Booking data model
export class Booking {
  constructor({
    id = '',
    functionDate = '',
    guests = 0,
    functionType = '',
    bookingBy = '',
    address = '',
    cnic = '',
    contactNumber = '',
    startTime = '',
    endTime = '',
    bookingDays = 1,
    bookingType = 'perHead', // 'perHead' or 'fixed'
    costPerHead = 0,
    fixedRate = 0,
    bookingDate = '',
    totalCost = 0,
    advance = 0,
    balance = 0,
    djCharges = 0,
    decorCharges = 0,
    tmaCharges = 0,
    otherCharges = 0,
    specialNotes = '',
    menuItems = [], // Array of menu item names
    payments = [] // Array of payment records
  } = {}) {
    this.id = id;
    this.functionDate = functionDate;
    this.guests = guests;
    this.functionType = functionType;
    this.bookingBy = bookingBy;
    this.address = address;
    this.cnic = cnic;
    this.contactNumber = contactNumber;
    this.startTime = startTime;
    this.endTime = endTime;
    this.bookingDays = bookingDays;
    this.bookingType = bookingType; // 'perHead' or 'fixed'
    this.costPerHead = costPerHead;
    this.fixedRate = fixedRate;
    this.bookingDate = bookingDate;
    this.totalCost = totalCost;
    this.advance = advance;
    this.balance = balance;
    this.djCharges = djCharges;
    this.decorCharges = decorCharges;
    this.tmaCharges = tmaCharges;
    this.otherCharges = otherCharges;
    this.specialNotes = specialNotes;
    this.menuItems = menuItems; // Array of menu item names (strings)
    this.payments = payments; // Array of payment records with { amount, date, method }
  }
}

export const FUNCTION_TYPES = [
  'Wedding',
  'Engagement',
  'Birthday',
  'Anniversary',
  'Corporate Event',
  'Other'
];

export const PREDEFINED_MENU_ITEMS = [
  'chicken biryani',
  'chicken karhai',
  'mutton korma'
];