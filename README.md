# login_sso

docker build . -t login_sso

docker run -d --name login_sso-container -p 8000:8000 login_sso
