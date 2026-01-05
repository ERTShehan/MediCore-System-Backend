# MediCore - Clinic Management System (Backend)

## 📌 Project Overview
This is the backend server for **MediCore**, a comprehensive Clinic Management System designed for a Rapid Application Development (RAD) module. It serves as a centralized API handling authentication, patient queuing, prescription management, and staff administration. The system ensures secure data handling between Doctors and Counter Staff.

## 🚀 Technologies & Tools
* **Runtime Environment:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (via Mongoose ODM)
* **Language:** TypeScript
* **Authentication:** JSON Web Tokens (Access & Refresh Tokens), Bcrypt (Password Hashing)
* **File/Image Storage:** Cloudinary
* **API Security:** CORS, Helmet, Rate Limiting

## ✨ Key Features

### 1. User Authentication & Authorization
* **Doctor Registration:** Secure account creation requiring a system-generated "Confirmation ID" (Admin validated).
* **Role-Based Login:** Distinguishes between 'Doctor' and 'Counter' roles upon login.
* **Token Management:** Implements secure Access Tokens and HTTP-Only Cookie based Refresh Tokens.

### 2. Staff Management (Doctor Role)
* Full control to **Add**, **Remove**, or **Edit** Counter Staff accounts.
* Ability to change staff status (Active/Inactive) to control system access.

### 3. Patient Queue Management
* **Patient Registration:** Counter staff registers patients (Name, Age, Phone) generating a sequential Appointment Number.
* **Live Queuing:** Doctors can "Invite" the next patient in the queue using the dashboard.
* **Status Updates:** Real-time updates on whether a patient is waiting, with the doctor, or completed.

### 4. Prescription & Billing System
* **Digital Prescriptions:** Doctors input medicine details directly into the system.
* **Billing Generation:** Once submitted by the Doctor, the Counter Staff can view the prescription to process payments.
* **Reporting:** functionality to generate and print medical bills/reports for patients.

### 5. Analytics & History
* **Daily Reports:** View total patient count for the day.
* **Medical History:** comprehensive view of all past patient records and treatments.

## 📂 Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    ```

2.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

3.  **Install Dependencies:**
    ```bash
    npm install
    ```

4.  **Run in Development Mode:**
    ```bash
    npm run dev
    ```

5.  **Build & Run for Production:**
    ```bash
    npm run build
    npm start
    ```

## 📡 API Structure (High Level)
* `/api/auth` - Handling Login, Register, and Token Refresh.
* `/api/doctor` - Staff management and dashboard analytics.
* `/api/patient` - Registration and Queue management.
* `/api/prescription` - Adding medicines and retrieving billing details.

## 🔗 Deployed URL
* **Backend API:** [Insert Deployed Link Here]