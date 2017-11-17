commands to create cert for fbMockServer
$ openssl genrsa -out fbServerKey.pem
$ openssl req -new -key fbServerKey.pem -out csr.pem
$ openssl x509 -req -days 9999 -in csr.pem -signkey fbServerKey.pem -out myCert.pem
$ rm csr.pem 