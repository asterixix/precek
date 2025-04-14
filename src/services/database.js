// Declare db instance at the module's top level
let db = null; // Initialize as null
const DB_NAME = 'PrecekDatabase';
const DB_VERSION = 20; // Match the existing database version
const PROCESSED_DATA_STORE = 'processedData';
const API_KEYS_STORE = 'apiKeys';

// Function to initialize the database using IndexedDB API
async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      // console.log("Database already initialized.");
      resolve(db); // Return existing instance if already initialized
      return;
    }

    // console.log("Initializing database...");
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      // console.log("Database upgrade needed.");
      const tempDb = event.target.result;
      if (!tempDb.objectStoreNames.contains(PROCESSED_DATA_STORE)) {
        // console.log(`Creating object store: ${PROCESSED_DATA_STORE}`);
        tempDb.createObjectStore(PROCESSED_DATA_STORE, { keyPath: 'id', autoIncrement: true });
        // Define indexes if needed, e.g., based on previous Dexie schema:
        // store.createIndex('inputName', 'inputName', { unique: false });
        // store.createIndex('timestamp', 'timestamp', { unique: false });
        // store.createIndex('analysisType', 'analysisType', { unique: false });
      }
      if (!tempDb.objectStoreNames.contains(API_KEYS_STORE)) {
        // console.log(`Creating object store: ${API_KEYS_STORE}`);
        tempDb.createObjectStore(API_KEYS_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      // console.log("Database initialized successfully.");
      // Add error handling for the db connection itself
      db.onerror = (event) => {
        console.error("Database error:", event.target.errorCode);
        db = null; // Reset db on connection error
      };
      resolve(db);
    };

    request.onerror = (event) => {
      // Use event.target.error for better error details
      console.error("Failed to initialize database:", event.target.error);
      db = null; // Reset db on failure
      reject(new Error(`Failed to initialize database: ${event.target.error?.message || 'Unknown error'}`)); // Include error message in rejection
    };

    request.onblocked = () => {
        console.warn("Database open request blocked, please close other tabs/connections.");
        // Potentially reject or inform the user
        reject(new Error("Database initialization blocked."));
    };
  });
}

// Function to get the database instance, ensuring it's initialized
async function getDb() {
    if (!db) {
        // console.log("Database not initialized, initializing now...");
        try {
            db = await initializeDatabase();
        } catch (error) {
            console.error("Error during getDb initialization:", error);
            throw error; // Re-throw to signal failure
        }
    }
    // Simple check if connection might be closed (though IndexedDB connections don't explicitly 'close' easily unless the browser context is lost)
    // A more robust check might involve trying a simple transaction.
    return db;
}


// --- Core Data Operations ---

// Helper function for transactions
function performTransaction(storeName, mode, operation) {
  return new Promise(async (resolve, reject) => {
    try {
      const currentDb = await getDb();
      if (!currentDb) {
        reject(new Error("Database not available."));
        return;
      }
      const transaction = currentDb.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);

      operation(store, resolve, reject); // Pass store, resolve, reject to the operation callback

      transaction.oncomplete = () => {
        // Resolve is typically called within the operation's success handler
        // console.log(`Transaction completed for ${storeName}`);
      };
      transaction.onerror = (event) => {
        console.error(`Transaction error on ${storeName}:`, event.target.error);
        reject(event.target.error);
      };
    } catch (error) {
        console.error(`Error starting transaction on ${storeName}:`, error);
        reject(error);
    }
  });
}


// Function to add processed data
async function addData(data) {
  return performTransaction(PROCESSED_DATA_STORE, 'readwrite', (store, resolve, reject) => {
    // Ensure timestamp is set if not provided
    if (!data.timestamp) {
        data.timestamp = new Date().toISOString();
    }
    // Remove 'id' if present, as it's auto-incrementing
    // delete data.id; // Or handle potential conflicts if ID is managed externally

    const request = store.add(data);
    request.onsuccess = (event) => {
      console.log(`Data added with ID: ${event.target.result}`, data);
      resolve(event.target.result); // Return the ID of the added record
    };
    request.onerror = (event) => {
      console.error('Error in addData request:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Function to retrieve all processed data, ordered by timestamp descending
async function getAllData() {
  return performTransaction(PROCESSED_DATA_STORE, 'readonly', (store, resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = (event) => {
      let allItems = event.target.result;
      // Sort by timestamp descending (since IndexedDB getAll doesn't guarantee order based on insertion)
      allItems.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      console.log(`Retrieved ${allItems.length} items from database.`);
      resolve(allItems);
    };
    request.onerror = (event) => {
      console.error('Error in getAllData request:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Function to clear all processed data
async function clearAllData() {
  return performTransaction(PROCESSED_DATA_STORE, 'readwrite', (store, resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => {
      console.log("Processed data store cleared.");
      resolve(true);
    };
    request.onerror = (event) => {
      console.error('Error in clearAllData request:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Function to get data by ID
async function getDataById(id) {
    // Convert the ID from string (from router query) to number for IndexedDB lookup
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
        console.error(`Invalid ID provided to getDataById: ${id}`);
        // Return null or throw an error, depending on desired behavior
        // Throwing an error might be better to signal a bad request
        throw new Error(`Invalid ID format: ${id}`);
    }

    return performTransaction(PROCESSED_DATA_STORE, 'readonly', (store, resolve, reject) => {
        // Use the converted numeric ID
        const request = store.get(numericId);
        request.onsuccess = (event) => {
            resolve(event.target.result); // Returns the item or undefined
        };
        request.onerror = (event) => {
            console.error(`Error in getDataById for ID ${numericId}:`, event.target.error);
            reject(event.target.error);
        };
    });
}

// Function to update data by ID
async function updateData(id, updates) {
    return performTransaction(PROCESSED_DATA_STORE, 'readwrite', async (store, resolve, reject) => {
        // Get the existing item first
        const getRequest = store.get(id);
        getRequest.onsuccess = (event) => {
            const existingData = event.target.result;
            if (existingData) {
                // Merge updates into existing data
                const updatedData = { ...existingData, ...updates, id }; // Ensure ID remains the same
                const putRequest = store.put(updatedData);
                putRequest.onsuccess = () => {
                    console.log(`Data updated for ID: ${id}`, updatedData);
                    resolve(true);
                };
                putRequest.onerror = (event) => {
                    console.error(`Error in updateData put request for ID ${id}:`, event.target.error);
                    reject(event.target.error);
                };
            } else {
                console.warn(`Data not found for update with ID: ${id}`);
                reject(new Error(`Data not found with ID: ${id}`));
            }
        };
        getRequest.onerror = (event) => {
            console.error(`Error in updateData get request for ID ${id}:`, event.target.error);
            reject(event.target.error);
        };
    });
}

// Function to delete data by ID
async function deleteData(id) {
    return performTransaction(PROCESSED_DATA_STORE, 'readwrite', (store, resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => {
            console.log(`Data deleted with ID: ${id}`);
            resolve(true);
        };
        request.onerror = (event) => {
            console.error(`Error in deleteData for ID ${id}:`, event.target.error);
            reject(event.target.error);
        };
    });
}


// --- API Key Management ---

// Function to save API keys (Upsert: update or insert)
async function saveApiKeys(keys) {
    return performTransaction(API_KEYS_STORE, 'readwrite', (store, resolve, reject) => {
        const dataToSave = { id: 1, keys }; // Assuming a single entry with id=1
        const request = store.put(dataToSave);
        request.onsuccess = () => {
            console.log("API keys saved/updated.");
            resolve(true);
        };
        request.onerror = (event) => {
            console.error('Error in saveApiKeys request:', event.target.error);
            reject(event.target.error);
        };
    });
}

// Function to retrieve API keys
async function retrieveApiKeys() {
    return performTransaction(API_KEYS_STORE, 'readonly', (store, resolve, reject) => {
        const request = store.get(1); // Assuming a single entry with id=1
        request.onsuccess = (event) => {
            const apiKeyEntry = event.target.result;
            resolve(apiKeyEntry ? apiKeyEntry.keys : null);
        };
        request.onerror = (event) => {
            console.error('Error in retrieveApiKeys request:', event.target.error);
            reject(event.target.error);
        };
    });
}


// --- Utility Functions ---

// Function to export data to CSV format (logic remains largely the same, uses new getAllData)
async function exportToCSV() {
  try {
    const data = await getAllData(); // Uses the new IndexedDB implementation

    // Generate CSV header based on data structure
    const sampleData = data.length > 0 ? data[0] : null;
    if (!sampleData) return 'No data to export';

    // Extract headers from the first data item
    // Adjust header extraction if data structure changed significantly
    const baseHeaders = ['id', 'inputName', 'timestamp', 'analysisType']; // Example headers
    const extraHeaders = Object.keys(sampleData)
      .filter(key => !baseHeaders.includes(key) && key !== 'processingResult') // Adjust based on actual structure
      .sort();

    const headers = [...baseHeaders, ...extraHeaders, 'processingResult']; // Adjust 'data' field name if needed
    let csv = headers.join(',') + '\n';

    // Add data rows
    data.forEach(item => {
      const row = headers.map(header => {
        let value = item[header];

        // Format value for CSV
        if (value === undefined || value === null) {
          return '';
        } else if (typeof value === 'object') {
          // Handle potential circular references if necessary
          try {
            value = JSON.stringify(value).replace(/"/g, '""');
          } catch (e) {
            value = '[Object]'; // Placeholder for complex/circular objects
          }
        }

        // Escape quotes and wrap in quotes
        return `"${String(value).replace(/"/g, '""')}"`;
      });

      csv += row.join(',') + '\n';
    });

    return csv;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    // Consider returning the error or a specific message
    // throw new Error('Error exporting data to CSV'); // Option: re-throw
     return 'Error exporting data to CSV';
  }
}


// --- Initialization ---

// No automatic initialization here. Let initialization happen on demand via getDb()
// or explicitly called by the application startup logic if needed.
// initializeDatabase().catch(error => {
//     console.error("Initial database initialization failed:", error);
// });


// --- Exports ---

// Ensure all functions intended for export are listed here
export {
  // db, // Don't export db instance directly
  initializeDatabase, // Export initializer if needed for explicit setup
  getDb, // Export the getter function
  addData,
  getAllData,
  clearAllData,
  getDataById,   // Exporting potentially useful CRUD operations
  updateData,
  deleteData,
  saveApiKeys,
  retrieveApiKeys,
  exportToCSV
};

// Optional: Default export could be the getDb function
// export default getDb;
