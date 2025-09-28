# DATABASE SETUP INSTRUCTIONS

## PostgreSQL Setup for CityService

### Prerequisites
1. Install PostgreSQL on your system
2. Make sure PostgreSQL service is running

### Database Configuration Steps

1. **Connect to PostgreSQL as superuser:**
   ```bash
   psql -U postgres
   ```

2. **Create the database:**
   ```sql
   CREATE DATABASE nancysgp;
   ```

3. **Create a user (optional, or use existing postgres user):**
   ```sql
   CREATE USER cityservice_user WITH PASSWORD 'your_password_here';
   GRANT ALL PRIVILEGES ON DATABASE nancysgp TO cityservice_user;
   ```

4. **Update the .env file with your database credentials:**
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/nancysgp
   ```

### Common Database URLs Examples:
- Using postgres user: `postgresql://postgres:your_postgres_password@localhost:5432/nancysgp`
- Using custom user: `postgresql://cityservice_user:your_password@localhost:5432/nancysgp`

### Testing Connection
Run this command to test your database connection:
```bash
node test-db.js
```

### Troubleshooting
1. **Authentication failed**: Check username and password in DATABASE_URL
2. **Database doesn't exist**: Create the database using the SQL commands above
3. **Connection refused**: Make sure PostgreSQL service is running
4. **Port issues**: Default PostgreSQL port is 5432, adjust if different

### Alternative: Use SQLite for Development
If you don't want to set up PostgreSQL, you can use SQLite for development by changing the database configuration in the backend code.