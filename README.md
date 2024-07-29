# GamePoint

GamePoint is a project of computer games shop web application with various additional features such as games custom reviews system, admin panel (TODO) and so on.

## Table of Contents

- [Demo](#demo)
- [Installation](#installation-for-development)

## Demo

[Vercel Deploy](https://game-point-xi.vercel.app/)

## Installation for development

### Requirements

Node.js

npm

git

Visual Studio Code

### Steps

1. Clone my repository

```sh
git clone https://github.com/Patrox255/GamePoint.git
```

2. Open my project in Visual Studio Code

Open Visual Studio Code application and the directory of the project by going 'File' -> 'Open Folder...' and selecting a directory where you cloned my repository.

3. Open a terminal in Visual Studio Code

- By clicking 'Terminal' -> 'New Terminal'
- By using keyboard shortcut: Ctrl+Shift+`

4. Navigate to the main directory in the terminal (if you aren't in it already)

```sh
cd GamePoint
```

5. Install dependencies for the front-end part of the app

```sh
npm install
```

6. Navigate to the back-end root directory

```sh
cd backend
```

7. Install dependencies for the back-end part of the app

```sh
npm install
```

8. Create a file containing environment back-end variables

Create a file called '.env' inside the root directory of the back-end side of the app (/backend)

9. Add the following environment variables to your '.env' file:

```env
 CLIENT_ID=your_igdb_api_client_id
 SECRET=your_igdb_api_client_secret
 JWTREFRESHSECRET=your_jwt_secret_for_refresh_tokens
 JWTSECRET=your_jwt_secret_for_access_tokens
 MONGO_URL=your_mongo_db_url
 FRONTEND_URLS=your_frontend_urls_to_allow_in_cors (a string with each URL separated by a comma)
```

10. Run back-end server

```sh
npm run dev
```

11. Open a new terminal for the front-end dev server

- By clicking 'Terminal' -> 'New Terminal'
- By using keyboard shortcut: Ctrl+Shift+`

12. Navigate to the main directory in the terminal (if you aren't in it already)

```sh
cd GamePoint
```

13. Run front-end server

```sh
npm run dev
```
