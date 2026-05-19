const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function test() {
    try {
        const formData = new FormData();
        formData.append("fullName", "Test Vendor");
        formData.append("email", "testvendor2@example.com");
        formData.append("phone", "0987654321");
        formData.append("businessName", "Test Business");
        formData.append("businessType", "Venue");
        formData.append("address", "123 Test St");
        formData.append("pincode", "123456");
        formData.append("state", "Test State");
        formData.append("status", "pending");
        formData.append("adminMessage", "");
        
        // Mock files
        const dummyFile = path.join(__dirname, '..', 'Sachin.jpg');
        formData.append("governmentId", fs.createReadStream(dummyFile));
        formData.append("licenseDoc", fs.createReadStream(dummyFile));

        // const res = await axios.post("http://localhost:3000/vendors/register", formData, {
        const res = await axios.post("http://10.113.216.96:3000/vendors/register", formData, {
            headers: {
                ...formData.getHeaders(),
            }
        });
        console.log("Success:", res.data);
    } catch (err) {
        console.error("Error:", err.response ? err.response.data : err.message);
    }
}
test();
