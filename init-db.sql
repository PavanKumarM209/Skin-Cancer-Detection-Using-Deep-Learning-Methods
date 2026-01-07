-- Initialize database script
-- This script runs when the PostgreSQL container is first created

-- Create database (if not exists via environment variable)
-- SELECT 'CREATE DATABASE skin_cancer_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'skin_cancer_db')\gexec

-- Connect to the database
\c skin_cancer_db

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE skin_cancer_db TO skin_cancer_user;
GRANT ALL ON SCHEMA public TO skin_cancer_user;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Optional: Create initial tables (Flask-Migrate will handle this)
-- Tables will be created by Flask-Migrate migrations

-- Display success message
SELECT 'Database initialized successfully!' as message;
