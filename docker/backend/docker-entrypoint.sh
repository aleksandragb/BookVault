#!/bin/sh

if [ ! -d vendor/ ]; then
    echo "Installing dependencies..."
    composer install --prefer-dist --no-progress --no-interaction
fi

php bin/console -V

if grep -q ^DATABASE_URL= .env; then
   echo 'Waiting for database to be ready...'
   ATTEMPTS_LEFT_TO_REACH_DATABASE=10
   until [ $ATTEMPTS_LEFT_TO_REACH_DATABASE -eq 0 ] || DATABASE_ERROR=$(php bin/console dbal:run-sql -q "SELECT 1" 2>&1); do
       sleep 1
       ATTEMPTS_LEFT_TO_REACH_DATABASE=$((ATTEMPTS_LEFT_TO_REACH_DATABASE - 1))
       echo "Still waiting for database to be ready... $ATTEMPTS_LEFT_TO_REACH_DATABASE attempts left."
   done

   if [ $ATTEMPTS_LEFT_TO_REACH_DATABASE -eq 0 ]; then
       echo 'The database is not up or not reachable:'
       echo "$DATABASE_ERROR"
       exit 1
   else
       echo 'The database is now ready and reachable'
   fi

   if [ "$(find ./migrations -iname '*.php' -print -quit)" ]; then
       php bin/console doctrine:migrations:migrate --no-interaction --all-or-nothing
   fi

   php bin/console lexik:jwt:generate-keypair --skip-if-exists
fi

exec docker-php-entrypoint "$@"
