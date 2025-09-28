// Simple API test
async function testAPI() {
    try {
        console.log('Testing backend API...');
        
        const response = await fetch('http://localhost:4000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'test@test.com',
                password: 'test123'
            })
        });
        
        const data = await response.json();
        console.log('Response status:', response.status);
        console.log('Response data:', data);
        
    } catch (error) {
        console.error('API test failed:', error.message);
    }
}

testAPI();