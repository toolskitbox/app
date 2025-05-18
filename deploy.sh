#!/bin/bash

# ToolsBox Production Deployment Script
# This script deploys both frontend and backend components to a production server
# without using Docker.

# Exit immediately if a command exits with a non-zero status
set -e

# Print commands and their arguments as they are executed
set -x

# Configuration variables - Update these as needed
FRONTEND_BUILD_DIR="./toolsbox-frontend/build"
BACKEND_DIR="./toolsbox-backend"
PRODUCTION_FRONTEND_DIR="/var/www/html/toolsbox-frontend"
PRODUCTION_BACKEND_DIR="/var/www/html/toolsbox-backend"
PRODUCTION_USER="www-data"
PRODUCTION_GROUP="www-data"
FRONTEND_DOMAIN="toolskitbox.com"
BACKEND_DOMAIN="api.toolskitbox.com"
PHP_VERSION="8.3"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to display messages
function echo_message() {
  echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# Function to display warnings
function echo_warning() {
  echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Function to display errors and exit
function echo_error() {
  echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
  exit 1
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo_error "Please run this script as root or with sudo"
fi

# ====================
# Install Dependencies
# ====================
echo_message "Installing system dependencies..."

# Update package lists
apt-get update

# Install dependencies
apt-get update && apt-get install -y \
    build-essential \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    locales \
    zip \
    jpegoptim optipng pngquant gifsicle \
    vim \
    unzip \
    git \
    curl \
    libzip-dev \
    libonig-dev \
    libxml2-dev \
    python3 \
    python3-pip \
    ffmpeg \
    procps

# Install Python and dependencies
apt-get update && \
    apt-get install -y python3-venv && \
    python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install yt-dlp && \
    ln -s /opt/venv/bin/yt-dlp /usr/local/bin/yt-dlp && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Apache and PHP
echo_message "Installing Apache and PHP..."
apt-get install -y apache2 apache2-utils ssl-cert
apt-get install -y php$PHP_VERSION php$PHP_VERSION-fpm php$PHP_VERSION-cli php$PHP_VERSION-common \
                   php$PHP_VERSION-mysql php$PHP_VERSION-zip php$PHP_VERSION-gd php$PHP_VERSION-mbstring \
                   php$PHP_VERSION-curl php$PHP_VERSION-xml php$PHP_VERSION-bcmath php$PHP_VERSION-json \
                   php$PHP_VERSION-intl php$PHP_VERSION-readline php$PHP_VERSION-ldap \
                   php$PHP_VERSION-msgpack php$PHP_VERSION-igbinary php$PHP_VERSION-redis php$PHP_VERSION-pdo_mysql \
                   php$PHP_VERSION-exif php$PHP_VERSION-pcntl 

# Clean apt installations
apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Node.js and npm (for frontend build)
echo_message "Installing Node.js and npm..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
  apt-get install -y nodejs
fi

# Install Composer (for Laravel)
echo_message "Installing Composer..."
if ! command -v composer &> /dev/null; then
  curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
fi

# Enable required Apache modules
echo_message "Enabling Apache modules..."
a2enmod rewrite
a2enmod ssl
a2enmod headers
a2enmod proxy_fcgi
a2enmod deflate
a2enmod expires
a2enmod setenvif
a2enconf php$PHP_VERSION-fpm

# Check if required directories exist
if [ ! -d "./toolsbox-frontend" ]; then
  echo_error "Frontend directory not found. Make sure you're running this script from the project root."
fi

if [ ! -d "./toolsbox-backend" ]; then
  echo_error "Backend directory not found. Make sure you're running this script from the project root."
fi

echo_message "Starting ToolsBox deployment process..."

# ====================
# Frontend Deployment
# ====================
echo_message "Building frontend..."

# Navigate to frontend directory
cd ./toolsbox-frontend

# Install dependencies
echo_message "Installing frontend dependencies..."
npm install --legacy-peer-deps

# Build the React application
echo_message "Building React application..."
npm run build

# Check if build was successful
if [ ! -d "./build" ]; then
  echo_error "Frontend build failed. Check the logs for errors."
fi

# Set proper permissions
echo_message "Setting frontend permissions..."
chown -R $PRODUCTION_USER:$PRODUCTION_GROUP $PRODUCTION_FRONTEND_DIR
chmod -R 755 $PRODUCTION_FRONTEND_DIR

echo_message "Frontend deployment completed successfully!"

# ====================
# Backend Deployment
# ====================
echo_message "Deploying backend..."

# Navigate to backend directory
cd ../toolsbox-backend

# Install Composer dependencies
echo_message "Installing backend dependencies..."
composer install --no-dev --optimize-autoloader

# Create storage directory structure if it doesn't exist
mkdir -p $PRODUCTION_BACKEND_DIR/storage/app/public
mkdir -p $PRODUCTION_BACKEND_DIR/storage/framework/cache
mkdir -p $PRODUCTION_BACKEND_DIR/storage/framework/sessions
mkdir -p $PRODUCTION_BACKEND_DIR/storage/framework/views
mkdir -p $PRODUCTION_BACKEND_DIR/storage/logs

# Copy .env file if it doesn't exist in production
if [ ! -f "$PRODUCTION_BACKEND_DIR/.env" ]; then
  echo_warning ".env file not found in production. Copying .env.example..."
  cp ./.env.example $PRODUCTION_BACKEND_DIR/.env
  echo_warning "Please update the .env file with your production settings!"
else
  echo_message "Using existing .env file in production."
fi

# Set proper permissions
echo_message "Setting backend permissions..."
chown -R $PRODUCTION_USER:$PRODUCTION_GROUP $PRODUCTION_BACKEND_DIR
chmod -R 755 $PRODUCTION_BACKEND_DIR
chmod -R 775 $PRODUCTION_BACKEND_DIR/storage
chmod -R 775 $PRODUCTION_BACKEND_DIR/bootstrap/cache

echo_message "Clearing Laravel cache..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

echo_message "Running database migrations..."
php artisan migrate --force

# Create storage link if it doesn't exist
if [ ! -L "$PRODUCTION_BACKEND_DIR/public/storage" ]; then
  echo_message "Creating storage link..."
  php artisan storage:link
fi

echo_message "Optimizing Laravel..."
php artisan optimize

# ====================
# Web Server Configuration
echo_message "Configuring Apache virtual hosts..."

# Copy Apache configuration files from the project directory if they exist
echo_message "Found Apache configurations in project directory. Copying to sites-available..."
cp ./apache-configs/*.conf /etc/apache2/sites-available/

# Enable sites
echo_message "Enabling Apache sites..."
a2ensite $FRONTEND_DOMAIN.conf
a2ensite $BACKEND_DOMAIN.conf

# Restart Apache
echo_message "Restarting Apache..."
systemctl restart apache2

echo_message "Deployment completed successfully!"
echo_message "Frontend: https://$FRONTEND_DOMAIN"
echo_message "Backend API: https://$BACKEND_DOMAIN"

# Final instructions
echo_warning "IMPORTANT: Please update the following:"
echo_warning "1. Replace self-signed SSL certificates with valid ones for production"
echo_warning "2. Update the .env file in the backend with your production settings"
echo_warning "3. Make sure your DNS records point to this server for $FRONTEND_DOMAIN and $BACKEND_DOMAIN"
echo_warning "4. Consider setting up Let's Encrypt for free SSL certificates:"
echo_warning "   sudo apt-get install certbot python3-certbot-apache"
echo_warning "   sudo certbot --apache -d $FRONTEND_DOMAIN -d www.$FRONTEND_DOMAIN"
echo_warning "   sudo certbot --apache -d $BACKEND_DOMAIN"
