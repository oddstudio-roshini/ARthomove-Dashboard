# ARthoMove Dashboard — Setup Guide

## Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+
- PostgreSQL 14+

---

## 1. Database Setup

Create the database:
```sql
CREATE DATABASE arthomove_db;
```

Update credentials in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/arthomove_db
spring.datasource.username=YOUR_USER
spring.datasource.password=YOUR_PASSWORD
```

---

## 2. Backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run
```

The backend runs on **http://localhost:8080**

Default admin is seeded automatically:
- Email: `admin@arthomove.com`
- Password: `Admin@123`

---

## 3. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on **http://localhost:3000**

---

## 4. Usage

### Admin Login
- Go to http://localhost:3000/login
- Use: `admin@arthomove.com` / `Admin@123`

### Doctor Login
- Go to http://localhost:3000/doctor-login
- Use credentials provided by admin (temporary password must be changed on first login)

### Passkey Login
1. Go to Admin Login page
2. Enter your email
3. Click "Register Passkey" to register your device
4. Next time, click "Sign in with Passkey"

---

## 5. CSV Import Format

See `doctors_csv_template.csv` for the format:
```
firstName,lastName,email,mobile,birthYear,specialization,clinic,status,notes
```

---

## 6. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/admin/login | Admin login |
| POST | /api/auth/doctor/login | Doctor login |
| POST | /api/auth/doctor/change-password | Change doctor password |
| POST | /api/auth/logout | Logout |
| POST | /api/auth/passkey/register/options | Start passkey registration |
| POST | /api/auth/passkey/register/verify | Complete passkey registration |
| POST | /api/auth/passkey/authenticate/options | Start passkey auth |
| POST | /api/auth/passkey/authenticate/verify | Complete passkey auth |
| GET | /api/doctors | List all doctors |
| POST | /api/doctors | Create doctor |
| PUT | /api/doctors/{id} | Update doctor |
| DELETE | /api/doctors/{id} | Delete doctor |
| GET | /api/doctors/{id}/logs | Get doctor login logs |
| POST | /api/doctors/upload-csv | Bulk import doctors from CSV |
| GET | /api/doctors/stats | Get doctor statistics |
