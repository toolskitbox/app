FROM php:8.3-fpm

# Set working directory
WORKDIR /var/www/html

# Install dependencies
RUN apt-get update && apt-get install -y \
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

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install intl pdo_mysql mbstring exif pcntl bcmath gd zip
RUN pecl install xdebug

# Install yt-dlp for YouTube downloads
RUN apt-get update && \
    apt-get install -y python3-venv && \
    python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install yt-dlp && \
    ln -s /opt/venv/bin/yt-dlp /usr/local/bin/yt-dlp && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy existing application directory contents
COPY . .
COPY ./utilities/php_extensions/. /usr/local/etc/php/conf.d/.

# Create necessary directories and set permissions
RUN mkdir -p /var/www/html/bootstrap/cache
RUN mkdir -p /var/www/html/storage/logs
RUN mkdir -p /var/www/html/storage/framework/sessions
RUN mkdir -p /var/www/html/storage/framework/views
RUN mkdir -p /var/www/html/storage/framework/cache
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
RUN chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Install Composer dependencies
RUN composer install

# Expose port 8000
EXPOSE 8000

# Start PHP server
CMD php artisan serve --host=0.0.0.0 --port=8000
