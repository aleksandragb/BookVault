FROM php:8.3-fpm

WORKDIR /var/www/backend

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libicu-dev \
    libonig-dev \
    libzip-dev \
    && docker-php-ext-install intl pdo pdo_mysql zip \
    && pecl install xdebug \
    && docker-php-ext-enable xdebug

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

COPY config/* $PHP_INI_DIR/conf.d/

COPY --link --chmod=755 docker-entrypoint.sh /usr/local/bin/docker-entrypoint
ENTRYPOINT ["docker-entrypoint"]

#CMD ["php-fpm"]
CMD ["php", "-S", "0.0.0.0:80", "-t", "public/"]