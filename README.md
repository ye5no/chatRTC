# chatRTC
chat on webRTC with File receiver

Main modules: NodeJS + Koa + SocketIO
DB: MYSQL / Sequelize
Auth: JWT
Development: esLint + babel + webPack
Tecnology: webRTC

# Init
npm -i

Make dir /config and put default.json and development.json

default.json examle:
{
  "jwt":{
    "secret": "veryBigSecret",
    "timeout" : 15000,
    "exp" : 6048000
  }
}

development.json example:
{
  "env" : "development",
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
