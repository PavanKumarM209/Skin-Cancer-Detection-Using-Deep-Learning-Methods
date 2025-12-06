#!/usr/bin/env python3
"""
Script to reset a patient's password
Usage: python reset_patient_password.py <email_or_username> <new_password>
"""

import sys
from app import app, db, Patient
from werkzeug.security import generate_password_hash

def reset_password(email_or_username, new_password):
    """Reset password for a patient account"""
    with app.app_context():
        # Find patient by email or username
        patient = Patient.query.filter(
            (Patient.email == email_or_username) | 
            (Patient.username == email_or_username)
        ).first()
        
        if not patient:
            print(f"❌ Patient not found: {email_or_username}")
            return False
        
        if len(new_password) < 8:
            print("❌ Password must be at least 8 characters long")
            return False
        
        # Reset password
        patient.set_password(new_password)
        db.session.commit()
        
        print(f"✅ Password reset successful for: {patient.email} (Username: {patient.username})")
        return True

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python reset_patient_password.py <email_or_username> <new_password>")
        print("\nExample:")
        print("  python reset_patient_password.py priyanshu@gmail.com MyNewPassword123")
        sys.exit(1)
    
    email_or_username = sys.argv[1]
    new_password = sys.argv[2]
    
    reset_password(email_or_username, new_password)



