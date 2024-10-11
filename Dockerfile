FROM httpd:latest

COPY ./dist/ /usr/local/apache2/htdocs/

COPY ./.htaccess /usr/local/apache2/htdocs/.htaccess

COPY ./httpd.conf /usr/local/apache2/conf/httpd.conf

EXPOSE 80/tcp