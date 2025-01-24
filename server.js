const express = require('express');
const mysql = require('mysql2');
const app = express();

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'KENYAkelvin@28*',
  database: 'bo_database'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ' + err.stack);
    return;
  }
  console.log('Connected to database');
});

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Serve static files like CSS or images
app.use(express.static('public'));

// Parse URL-encoded data (for form submissions)
app.use(express.urlencoded({ extended: true }));

// Route to the homepage
app.get('/', (req, res) => {
  const staffNumber = req.query.staff_number;  // Get staff number from query parameter
  const mobileNumber = req.query.mobile_number;  // Get mobile number (password) from query parameter

  let errorMessage = null; // Initialize errorMessage as null

  if (staffNumber && mobileNumber) {
    // Query for a specific staff member by Staff Number
    connection.query('SELECT * FROM boshg_main WHERE Staff_Number = ?', [staffNumber], (err, results) => {
      if (err) {
        console.error('MySQL Error: ', err);
        errorMessage = 'Error fetching data'; // Set error message
        return res.render('index', { staff: null, errorMessage });
      }

      // If a staff record is found, check if mobile number matches
      if (results.length > 0) {
        const staff = results[0];

        // Access the mobile phone number properly (handle spaces in the column name)
        const storedMobileNumber = staff['Mobile Phone Number'] ? staff['Mobile Phone Number'].toString().trim() : '';

        // Log for debugging (can be removed later)
        console.log('Entered Mobile Number: ', mobileNumber.trim());
        console.log('Stored Mobile Number: ', storedMobileNumber);

        // Now compare the two numbers
        if (mobileNumber.trim() === storedMobileNumber) {
          // If mobile number matches, show staff details
          return res.render('index', { staff: staff, errorMessage });
        } else {
          // If mobile number does not match, show "Invalid password" error
          errorMessage = 'Invalid password';  // Update the error message here
          return res.render('index', { staff: null, errorMessage });
        }
      } else {
        // If no staff record found, show "No staff found" error
        errorMessage = 'No staff found with that Staff Number';
        return res.render('index', { staff: null, errorMessage });
      }
    });
  } else {
    // If no staff number or mobile number is provided, just show the search form
    res.render('index', { staff: null, errorMessage });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
