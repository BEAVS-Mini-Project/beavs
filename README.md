
Project Documentation - Group 7
Group Members
1.	Konadu Kwabena Boateng - 3395422
2.	Adumua Dowuona Phil Nortey - 3364022
3.	Armah Lawrence Nii - 3375222

Project Title: Biometric Exam Attendance Verification System (BEAVS)

Project Overview
This project proposes the development of a biometric-based attendance verification system for examinations in academic institutions. The current manual process—where invigilators collect signatures on paper—has proven to be vulnerable to impersonation and misplacement of signatures. The proposed solution introduces a fingerprint scanner-based attendance system to eliminate manual errors, prevent impersonation, and improve the integrity of exam attendance records.

System Workflow
 1. Pre-Exam Registration:
 • Every student’s fingerprint is enrolled into the system during the student biometric registration period and linked with their student ID and course enrollment details.
 2. Exam Hall Setup:
 • Each exam hall is configured with a list of students assigned to write in that hall.
 • A mobile app or tablet with a connected fingerprint scanner is given to the invigilator.
 3. During the Exam:
 • Invigilators go around with the scanner.
 • Students are prompted to scan their fingerprint.
 • The system checks if:
 • The fingerprint matches an enrolled student.
 • The student is supposed to be in that particular hall.
 • If valid, the system logs the attendance with a timestamp and marks the student as present for that exam.
 4. Post-Exam Reporting:
 • Admins and invigilators can access real-time attendance reports via a secure dashboard.
 • Reports can be exported for record-keeping and further audit.

Proposed Technologies
Component Technology
Frontend : React Native
Backend : Node.js
Biometric Interface Fingerprint Scanner SDK : Digital Persona
Database : Supabase
Hosting : Google Cloud

Expected Outcome
A fully functional prototype of a biometric exam attendance system that:
 • Authenticates students using their fingerprint.
 • Prevents impersonation and signature-related confusion.
 • Provides invigilators and administrators with a reliable and digital attendance record.

