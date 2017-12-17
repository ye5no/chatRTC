# chatRTC
Chat on webRTC with File receiver

 - Main modules: NodeJS + Koa + SocketIO
 - DB: MYSQL / Sequelize
 - Auth: JWT
 - Development: esLint + babel + webPack
 - Tecnology: webRTC

Require:
 - Node >=7.0
 - MYSQL


## Installation
```
npm install
```

Make dir /config and put default.json and production.json

default.json examle:
```js
{
  "jwt":{
    "secret": "veryBigSecret",
    "timeout" : 15000,
    "exp" : 6048000
  }
}
```
production.json example:
```js
{
  "env" : "production",
  "ip": "yourServerIP",
  "port": 80,
  "dir": "yourDirName",
  "sql" : {
    "database": "yourDataBase",
    "username": "yourUserDB",
    "password": "yourUPasswordDB",
    "options" : {
      "host": "yourHostDB",
      "port": 3306,
      "dialect": "mysql",
      "logging": false
    }
  }
}
```

## Start
```
npm run start
```
