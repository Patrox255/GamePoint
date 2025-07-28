# GamePoint

GamePoint is a project of computer games shop web application with various additional features such as games custom reviews system, admin panel (TODO) and so on.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Demo](#demo)
- [Visual preview of key features](#visual-preview-of-key-features)
- [Installation](#installation-for-development)

## Tech Stack

### Front end
- React

- TypeScript

- State management: Redux Toolkit

- Data fetching/caching: TanStack Query

- Styling: Tailwind CSS

- Deployment: Vercel

### Back end

- Node.js + Express (custom REST API)

- MongoDB with Mongoose ODM

- JWT auth (access & refresh tokens)

- IGDB API (via Twitch authentication) for game data

- Vercel Blob for storing uploaded artworks

## Demo

[Vercel Deploy](https://game-point-xi.vercel.app/)

### Demo Users Credentials

Basically all of the created sample users thanks to the **/init** endpoint have their password set to their login with first letter capitalized so that it is fairly easy to log into their accounts. Because of that you can for instance find an user which you like on any product reviews section as reviews of the products are also automatically generated and simply log into the chosen account using provided formula!

Some of the accounts have been set to be admins as well but to save time looking for them here are credentials for one of the admin accounts:

**Login:** `testing123!`  
**Password:** `Testing123!`

_Note: These credentials are for demonstration purposes only._

## Visual preview of key features

### Artwork Slider

https://github.com/user-attachments/assets/8ed2d6b8-2680-4728-9b3a-c3b5e53c24fb

### Review System

https://github.com/user-attachments/assets/bd3ad21a-6a2e-40c4-9897-22e90c30303b

### Custom Date Picker

https://github.com/user-attachments/assets/0d8ba2ef-a339-46e1-b588-e64b59b1e592

### Advanced Search Engine

https://github.com/user-attachments/assets/678ccc50-2642-4865-9edc-f918b764d31e

### Contact Details Manager

https://github.com/user-attachments/assets/e5024270-c6c2-469f-8221-4df272af74c1

### Artwork Manager

https://github.com/user-attachments/assets/6dc78319-764c-4d4f-875e-5dabcdcb963f

### Admin Panel

https://github.com/user-attachments/assets/bb50995c-545b-4da3-970e-c244cba5bea9

### Notification System

Active throughout all of the application effectively letting the user know what's happening and visible for example in the video above.

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
 MAX_ORDERS_PER_PAGE=your_choice_of_maximum_number_of_orders_which_will_be_displayed_at_one_time_on_user_panel_page
 MAX_USERS_PER_PAGE=your_choice_of_maximum_number_of_users_which_will_be_displayed_at_one_time_on_admin_panel_page_users_section
 FRONTEND_URL_FOR_COOKIES=domain_to_set_app_cookies_to_be_able_to_be_read_by_backend_from_frontend
 BACKEND_URL_FOR_COOKIES=normally_you_only_have_to_set_the_above_one_but_in_case_your_backend_and_frontend_are_on_different_
 domains_then_set_them_correctly
 BLOB_READ_WRITE_TOKEN=read_and_write_vercel_blob_token_in_order_to_save_artworks_uploaded_while_editing_or_adding_products
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
