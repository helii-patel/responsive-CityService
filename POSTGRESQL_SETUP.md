# 🔑 PostgreSQL Credentials Setup Guide

## Current Status
- ✅ PostgreSQL 17.6 is installed and running
- ❌ Password authentication is failing
- 🎯 Need to set/reset the postgres user password

## Solution Options (Choose One)

### **Option 1: Reset PostgreSQL Password (Recommended)**

1. **Open Command Prompt as Administrator**
2. **Stop PostgreSQL service:**
   ```cmd
   net stop postgresql-x64-17
   ```

3. **Start PostgreSQL in single-user mode:**
   ```cmd
   "C:\Program Files\PostgreSQL\17\bin\postgres" --single -D "C:\Program Files\PostgreSQL\17\data" postgres
   ```

4. **Reset password (in the single-user session):**
   ```sql
   ALTER USER postgres PASSWORD 'newpassword123';
   ```

5. **Exit and restart service:**
   ```cmd
   net start postgresql-x64-17
   ```

### **Option 2: Use pgAdmin to Reset Password**

1. Open pgAdmin (if installed)
2. Connect to local server
3. Right-click on postgres user → Properties
4. Set new password

### **Option 3: Edit pg_hba.conf (Temporary)**

1. **Find pg_hba.conf file:**
   ```
   C:\Program Files\PostgreSQL\17\data\pg_hba.conf
   ```

2. **Edit the file and change:**
   ```
   # Change this line:
   host    all             all             127.0.0.1/32            scram-sha-256
   
   # To this (temporarily):
   host    all             all             127.0.0.1/32            trust
   ```

3. **Restart PostgreSQL service:**
   ```cmd
   net stop postgresql-x64-17
   net start postgresql-x64-17
   ```

4. **Now connect without password and set new one:**
   ```cmd
   psql -U postgres -d postgres -h localhost
   ```
   ```sql
   ALTER USER postgres PASSWORD 'your_new_password';
   ```

5. **Change pg_hba.conf back to scram-sha-256 and restart service**

### **Option 4: Create New User (Alternative)**

```sql
-- Connect as postgres user (once you can)
CREATE USER cityservice WITH PASSWORD 'cityservice123';
CREATE DATABASE nancysgp OWNER cityservice;
GRANT ALL PRIVILEGES ON DATABASE nancysgp TO cityservice;
```

Then use: `postgresql://cityservice:cityservice123@localhost:5432/nancysgp`

## 🎯 Once You Have Working Credentials

Update your `.env` file with the working credentials:
```
DATABASE_URL=postgresql://username:password@localhost:5432/nancysgp
```

Test with:
```bash
cd backend
node test-db.js
```

## 🆘 If All Else Fails

**Use SQLite for Development Instead:**
I can help you switch to SQLite which doesn't require password setup.