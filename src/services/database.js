// Web-compatible database implementation using IndexedDB
const DB_NAME = 'precekDB';
const DB_VERSION = 1;
const STORE_NAME = 'processedData';

// Initialize the database
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('Error opening database:', event.target.error);
      reject(event.target.error);
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        });
        
        // Create indexes
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

// Insert data into the database
const insertData = async (type, data) => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      // Parse data if it's a JSON string, otherwise use as is
      let dataObj;
      if (typeof data === 'string') {
        try {
          dataObj = JSON.parse(data);
        } catch (e) {
          dataObj = { content: data };
        }
      } else {
        dataObj = data;
      }
      
      // Add timestamp if not present
      if (!dataObj.timestamp) {
        dataObj.timestamp = new Date().toISOString();
      }
      
      // Add type if not in the data object
      if (!dataObj.type) {
        dataObj.type = type;
      }
      
      const request = store.add(dataObj);
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      
      request.onerror = (event) => {
        console.error('Error inserting data:', event.target.error);
        reject(event.target.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error in insertData:', error);
    return null;
  }
};

// Get all data
const getAllData = async () => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      
      request.onerror = (event) => {
        console.error('Error getting data:', event.target.error);
        reject(event.target.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error in getAllData:', error);
    return [];
  }
};

// Get data by type
const getDataByType = async (type) => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('type');
      const request = index.getAll(type);
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      
      request.onerror = (event) => {
        console.error('Error getting data by type:', event.target.error);
        reject(event.target.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error in getDataByType:', error);
    return [];
  }
};

// Export all data to CSV
const exportToCSV = async () => {
  try {
    const data = await getAllData();
    
    // Generate CSV header based on data structure
    const sampleData = data.length > 0 ? data[0] : null;
    if (!sampleData) return 'No data to export';
    
    // Extract headers from the first data item
    const baseHeaders = ['id', 'type', 'timestamp'];
    const extraHeaders = Object.keys(sampleData)
      .filter(key => !baseHeaders.includes(key) && key !== 'data')
      .sort();
    
    const headers = [...baseHeaders, ...extraHeaders, 'data'];
    let csv = headers.join(',') + '\n';
    
    // Add data rows
    data.forEach(item => {
      const row = headers.map(header => {
        let value = item[header];
        
        // Format value for CSV
        if (value === undefined || value === null) {
          return '';
        } else if (typeof value === 'object') {
          value = JSON.stringify(value).replace(/"/g, '""');
        }
        
        // Escape quotes and wrap in quotes
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      
      csv += row.join(',') + '\n';
    });
    
    return csv;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return 'Error exporting data to CSV';
  }
};

// Clear all data
const clearAllData = async () => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = (event) => {
        console.error('Error clearing data:', event.target.error);
        reject(event.target.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error in clearAllData:', error);
    return false;
  }
};

// Initialize the database when this module is imported, clearing previous data for each session
const initializeDatabase = async () => {
  if (typeof window !== 'undefined' && window.indexedDB) {
    try {
      // Generate a unique session ID for this browser session
      if (!window.sessionStorage.getItem('precekSessionId')) {
        window.sessionStorage.setItem('precekSessionId', Date.now().toString());
        console.log('New user session started, clearing previous database');
        
        // Clear any existing data before initializing
        const db = await initDB();
        await clearAllData();
      }
      
      console.log('Database initialized for current session');
    } catch (err) {
      console.error('Database initialization failed:', err);
    }
  } else {
    console.warn('IndexedDB is not available in this environment');
  }
};

// Call initialization
if (typeof window !== 'undefined') {
  // Only initialize in browser environment
  initializeDatabase();
  
  // Also clear data when page is being unloaded
  window.addEventListener('beforeunload', () => {
    // This helps ensure data doesn't persist between sessions
    clearAllData().catch(err => console.log('Error clearing data on unload:', err));
  });
}

export { insertData, getAllData, getDataByType, exportToCSV, clearAllData };
