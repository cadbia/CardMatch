// Define category mapping rules
export const categoryMappings = {
    // Dining & Restaurants
    "STARBUCKS": "Dining",
    "DUNKIN": "Dining",
    "CHIPOTLE": "Dining",
    "MCDONALD": "Dining",
    "BURGER KING": "Dining",
    "WENDY'S": "Dining",
    "SUBWAY": "Dining",
    "PANERA": "Dining",
    "DOMINOS": "Dining",
    "PIZZA HUT": "Dining",
    "TACO BELL": "Dining",
    "RESTAURANT": "Dining",
    "BUFFALO WILD WINGS": "Dining",
    "KFC": "Dining",
    "RAISING CANE'S": "Dining",
    "SHAKE SHACK": "Dining",

    // Supermarkets / Grocery Stores
    "WHOLE FOODS": "Groceries",
    "TRADER JOE'S": "Groceries",
    "KROGER": "Groceries",
    "SAFEWAY": "Groceries",
    "ALDI": "Groceries",
    "PUBLIX": "Groceries",
    "WALMART": "Groceries",
    "BJ'S": "Groceries",
    "COSTCO": "Groceries",
    "SAM'S CLUB": "Groceries",

    // Gas Stations
    "EXXON": "Gas",
    "MOBIL": "Gas",
    "SHELL": "Gas",
    "CHEVRON": "Gas",
    "BP": "Gas",
    "SUNOCO": "Gas",
    "7-ELEVEN": "Gas",
    "CIRCLE K": "Gas",
    "MARATHON": "Gas",
    "QT": "Gas",

    // Travel (Airlines, Hotels, Rentals)
    "DELTA": "Travel",
    "UNITED": "Travel",
    "AMERICAN AIRLINES": "Travel",
    "JETBLUE": "Travel",
    "SOUTHWEST": "Travel",
    "SPIRIT": "Travel",
    "AIRLINE": "Travel",
    "MARRIOTT": "Hotels",
    "HILTON": "Hotels",
    "HYATT": "Hotels",
    "HOLIDAY INN": "Hotels",
    "HOTEL": "Hotels",
    "AIRBNB": "Hotels",
    "ENTERPRISE": "Car Rental",
    "AVIS": "Car Rental",
    "BUDGET": "Car Rental",
    "HERTZ": "Car Rental",

    // Transit / Ride Sharing
    "UBER": "Transit",
    "LYFT": "Transit",
    "METROCARD": "Transit",
    "SUBWAY": "Transit",
    "MTA": "Transit",
    "AMTRAK": "Transit",
    "SCOOTER": "Transit",

    // Streaming Services
    "NETFLIX": "Streaming",
    "SPOTIFY": "Streaming",
    "HULU": "Streaming",
    "DISNEY+": "Streaming",
    "APPLE MUSIC": "Streaming",
    "YOUTUBE PREMIUM": "Streaming",
    "HBO": "Streaming",
    "AMAZON PRIME VIDEO": "Streaming",
    "PEACOCK": "Streaming",

    // Online & Retail Shopping
    "AMAZON": "Shopping",
    "TARGET": "Shopping",
    "BEST BUY": "Shopping",
    "WALMART.COM": "Shopping",
    "EBAY": "Shopping",
    "ETSY": "Shopping",
    "APPLE STORE": "Shopping",
    "GOOGLE STORE": "Shopping",
    "NIKE": "Shopping",
    "ADIDAS": "Shopping",
    "MACY'S": "Shopping",
    "NORDSTROM": "Shopping",
    "SHEIN": "Shopping",

    // Drug Stores / Pharmacies
    "CVS": "Pharmacy",
    "WALGREENS": "Pharmacy",
    "RITE AID": "Pharmacy",
    "PHARMACY": "Pharmacy",

    // Utilities & Phone / Internet
    "COMCAST": "Utilities",
    "XFINITY": "Utilities",
    "VERIZON": "Phone & Internet",
    "T-MOBILE": "Phone & Internet",
    "AT&T": "Phone & Internet",
    "SPECTRUM": "Utilities",
    "ELECTRIC": "Utilities",
    "WATER": "Utilities",
    "GAS BILL": "Utilities",

    // Health & Fitness
    "PLANET FITNESS": "Fitness",
    "LA FITNESS": "Fitness",
    "24 HOUR FITNESS": "Fitness",
    "ORANGETHEORY": "Fitness",
    "GYM": "Fitness",
    "FITNESS": "Fitness",
    "PELOTON": "Fitness",
    "KAISER": "Healthcare",
    "UNITEDHEALTH": "Healthcare",
    "DENTIST": "Healthcare",
    "DOCTOR": "Healthcare",

    // Subscriptions & Digital Tools
    "MICROSOFT": "Software",
    "ADOBE": "Software",
    "DROPBOX": "Cloud Storage",
    "GITHUB": "Software",
    "ZOOM": "Software",
    "NOTION": "Software",

    // Personal Care
    "SALON": "Personal Care",
    "SPA": "Personal Care",
    "BARBER": "Personal Care",
    "HAIRCUT": "Personal Care",

    // Financial & Transfers
    "TRANSFER": "Transfers",
    "FROM": "Transfers",
    "VENMO": "Transfers",
    "CASH APP": "Transfers",
    "ZELLE": "Transfers",
    "PAYPAL": "Transfers",
    "ATM": "Cash Withdrawal",
    "WITHDRAWAL": "Cash Withdrawal",
    "DEPOSIT": "Deposit",

    // Education & Books
    "CHEGG": "Education",
    "COURSERA": "Education",
    "UDEMY": "Education",
    "TEXTBOOK": "Education",
    "BARNES & NOBLE": "Education",

    // Charitable
    "DONATION": "Charity",
    "GOFUNDME": "Charity",
    "CHURCH": "Charity",
}


// Function to categorize transaction based on description
export function categorizeTransaction(description) {
    if (!description) return 'Select Category';
    
    const upperDesc = description.toUpperCase();
    
    // Check each keyword against the description
    for (const [keyword, category] of Object.entries(categoryMappings)) {
      if (upperDesc.includes(keyword.toUpperCase())) {
        return category;
      }
    }
    
    return 'Select Category';
  }
  
  // Function to normalize amount
  export function normalizeAmount(amount) {
    if (!amount) return null;
    
    try {
      // Handle amount as string or number
      const amountStr = amount.toString();
      
      // Remove currency symbols and whitespace
      let cleanAmount = amountStr.replace(/[$,\s]/g, '');
      
      // Handle negative amounts indicated by parentheses
      if (amountStr.startsWith('(') && amountStr.endsWith(')')) {
        cleanAmount = cleanAmount.replace(/[()]/g, '');
        cleanAmount = '-' + cleanAmount;
      }
      
      // Handle negative amounts indicated by minus sign
      // Make sure we don't double-negative amounts
      if (amountStr.includes('-') && !cleanAmount.startsWith('-')) {
        cleanAmount = '-' + cleanAmount.replace('-', '');
      }
      
      // Convert to number
      const number = parseFloat(cleanAmount);
      
      // Return null if not a valid number
      return isNaN(number) ? null : number;
    } catch (error) {
      console.error('Error normalizing amount:', error);
      return null;
    }
  }
  
  // Function to parse and validate date
  export function parseDate(dateStr) {
    if (!dateStr) return null;
    
    try {
      // Try parsing as ISO date first
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date;
      }
      
      // Try common date formats
      const formats = [
        // MM/DD/YYYY
        str => {
          const [month, day, year] = str.split(/[/-]/);
          return new Date(year, month - 1, day);
        },
        // DD/MM/YYYY
        str => {
          const [day, month, year] = str.split(/[/-]/);
          return new Date(year, month - 1, day);
        },
        // YYYY/MM/DD
        str => {
          const [year, month, day] = str.split(/[/-]/);
          return new Date(year, month - 1, day);
        }
      ];
      
      for (const format of formats) {
        try {
          const date = format(dateStr);
          if (!isNaN(date.getTime())) {
            return date;
          }
        } catch (e) {
          continue;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing date:', error);
      return null;
    }
  }