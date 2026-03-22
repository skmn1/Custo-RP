#!/bin/bash

# Database Setup Script for Staff Scheduler Pro
# This script automates PostgreSQL database creation and configuration

set -e  # Exit on error

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  Staff Scheduler Pro - PostgreSQL Database Setup              ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-staff_scheduler}
DB_USER=${DB_USER:-scheduler_admin}
DB_PASSWORD=${DB_PASSWORD:-scheduler_password}

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Function to check if PostgreSQL is running
check_postgres() {
    echo ""
    print_info "Checking PostgreSQL installation..."
    
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL client (psql) not found"
        print_info "Install PostgreSQL: apt-get install postgresql-client (Ubuntu)"
        exit 1
    fi
    
    print_success "PostgreSQL installed"
}

# Function to test database connection
test_connection_as_superuser() {
    echo ""
    print_info "Testing PostgreSQL superuser connection..."
    
    if sudo -u postgres psql -c "SELECT 1" > /dev/null 2>&1; then
        print_success "PostgreSQL superuser connection OK"
        return 0
    else
        print_error "Cannot connect to PostgreSQL as postgres user"
        print_info "Make sure PostgreSQL is running: sudo systemctl start postgresql"
        exit 1
    fi
}

# Function to create database user
create_database_user() {
    echo ""
    print_info "Creating database user '$DB_USER'..."
    
    # Check if user already exists
    if sudo -u postgres psql -tAc "SELECT 1 FROM pg_user WHERE usename = '$DB_USER'" | grep -q 1; then
        print_warning "User '$DB_USER' already exists"
        read -p "Do you want to reset the password? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sudo -u postgres psql <<EOF
ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
ALTER ROLE $DB_USER CREATEDB;
EOF
            print_success "User password reset"
        fi
    else
        sudo -u postgres psql <<EOF
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
ALTER ROLE $DB_USER CREATEDB;
EOF
        print_success "User '$DB_USER' created"
    fi
}

# Function to create database
create_database() {
    echo ""
    print_info "Creating database '$DB_NAME'..."
    
    # Check if database already exists
    if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
        print_warning "Database '$DB_NAME' already exists"
        read -p "Do you want to drop and recreate it? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sudo -u postgres psql <<EOF
DROP DATABASE IF EXISTS $DB_NAME;
CREATE DATABASE $DB_NAME OWNER $DB_USER;
EOF
            print_success "Database '$DB_NAME' dropped and recreated"
        else
            print_info "Using existing database"
        fi
    else
        sudo -u postgres psql <<EOF
CREATE DATABASE $DB_NAME OWNER $DB_USER;
EOF
        print_success "Database '$DB_NAME' created"
    fi
}

# Function to grant privileges
grant_privileges() {
    echo ""
    print_info "Granting privileges to '$DB_USER'..."
    
    sudo -u postgres psql <<EOF
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF
    
    print_success "Privileges granted"
}

# Function to test user connection
test_connection_as_user() {
    echo ""
    print_info "Testing connection as '$DB_USER'..."
    
    if PGPASSWORD="$DB_PASSWORD" psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1" > /dev/null 2>&1; then
        print_success "User connection successful"
        return 0
    else
        print_error "Cannot connect as '$DB_USER'"
        print_info "Check password and try again"
        return 1
    fi
}

# Function to display connection info
display_connection_info() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║  PostgreSQL Connection Information                            ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo "Host:        $DB_HOST"
    echo "Port:        $DB_PORT"
    echo "Database:    $DB_NAME"
    echo "User:        $DB_USER"
    echo "Password:    $DB_PASSWORD"
    echo ""
    echo "Connection string:"
    echo "psql -h $DB_HOST -U $DB_USER -d $DB_NAME"
    echo ""
    echo "JDBC URL:"
    echo "jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME"
    echo ""
}

# Function to update application.yml
update_application_yml() {
    echo ""
    read -p "Do you want to update application.yml with these settings? (y/n) " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        return
    fi
    
    YAML_FILE="../staff-scheduler-api/src/main/resources/application.yml"
    
    if [ ! -f "$YAML_FILE" ]; then
        print_warning "application.yml not found at $YAML_FILE"
        return
    fi
    
    # Backup original
    cp "$YAML_FILE" "$YAML_FILE.bak"
    print_success "Backed up application.yml to application.yml.bak"
    
    # Update YAML file (if using sed/awk - sample, actual implementation depends on OS)
    print_info "Update application.yml manually with these settings:"
    cat <<EOF
spring:
  datasource:
    url: jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME
    username: $DB_USER
    password: $DB_PASSWORD
EOF
}

# Main execution
main() {
    print_info "Configuration:"
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT"
    echo "  Database: $DB_NAME"
    echo "  User: $DB_USER"
    echo ""
    
    check_postgres
    test_connection_as_superuser
    create_database_user
    create_database
    grant_privileges
    test_connection_as_user
    display_connection_info
    update_application_yml
    
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║  Database Setup Complete!                                    ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    print_success "PostgreSQL database is ready"
    print_info "Next steps:"
    echo "  1. Update application.yml with database credentials"
    echo "  2. Start the Spring Boot backend"
    echo "  3. Tables will be created automatically"
    echo "  4. Seed data will be loaded automatically"
    echo ""
    print_info "To verify setup:"
    echo "  psql -h $DB_HOST -U $DB_USER -d $DB_NAME"
    echo "  \\dt  -- List tables"
    echo "  SELECT COUNT(*) FROM employees;  -- Should show 12"
    echo ""
}

# Run main function
main
