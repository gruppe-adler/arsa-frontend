FROM httpd:latest

COPY ./dist/ /usr/local/apache2/htdocs/

EXPOSE 80/tcp