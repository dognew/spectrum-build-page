# Use the official PHP Apache image
FROM php:8.2-apache

# Set the working directory
WORKDIR /var/www/html

# Enable Apache mod_rewrite (useful for clean URLs if needed later)
RUN a2enmod rewrite

# Set permissions for the web server to access the files
RUN chown -R www-data:www-data /var/www/html