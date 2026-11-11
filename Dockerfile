FROM httpd:latest

COPY ./dist/ /usr/local/apache2/htdocs/

COPY ./.htaccess /usr/local/apache2/htdocs/.htaccess

COPY ./httpd.conf /usr/local/apache2/conf/httpd.conf

# Run httpd as the unprivileged user www-data. It writes its pid file and runtime files to logs/.
RUN chown www-data:www-data /usr/local/apache2/logs
USER www-data

EXPOSE 80/tcp
