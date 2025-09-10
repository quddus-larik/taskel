## Taskel
A Team Collaborative task management web application built with Passport.js, React Vite and Typescript. UI devloped with Tailwindcss and headless UI.


#### Clone the Repo
```bash
git clone https://github.com/quddus-larik/taskel.git
```
#### Files Tree
```json
"taskel": {
   "/client": {.../},
   "/server": {.../}
}
```

#### Build & Configs
###### Server
```bash
cd server
```
###### node install
```bash
npm install
```
##### run server at port:4000
```bash
npm run dev
```
###### Client
```bash
cd client
```
###### node install
```bash
npm install
```
##### run server at port:5173
```bash
npm run dev
```
>[!WARNING]
>the `enviroment` file not present at repo so, the variables that are used in repo are @mentioned

###### For Backend
```
DB_USER=..
DB_PASSWORD=..
DB_HOST=...
DB_PORT=5432
DB_NAME=taskle_db
DB_STRING=..
SESSION_SECRET=..
PORT=4000
SMTP_USER=..
SMTP_PASS=..
NODE_ENV=production || deve
CLIENT_URL=..
```
###### For Frontend
```
VITE_API_URL=...
```
###### PR History SCT
![](/pr-history.png)


