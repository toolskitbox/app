# ToolsBox - Your All-in-One Online Toolkit

ToolsBox is a comprehensive web application that provides a collection of over 30 useful online tools for various tasks. From media conversion to developer utilities, ToolsBox offers a wide range of tools to help users with their everyday online tasks.

## Features

The application includes the following tool categories:

### Media Tools
- YouTube / Dailymotion video downloader
- Audio converter
- Image resizer/compressor/converter
- Video converter

### Text Tools
- File converter (PDF to DOC, DOC to PDF, etc.)
- String length, hashing & encrypting
- Word counter / character counter
- Case converter (UPPERCASE, lowercase, Title Case)
- Text difference checker (diff viewer)
- Binary text converter
- Stylish text generator (for Instagram/Facebook bios)

### Web Tools
- QR code generator & scanner
- URL shortener
- IP Address lookup & geolocation
- Meta tag generator
- URL encoder/decoder
- Slug generator
- Temporary email generator
- Online notepad

### Developer Tools
- Regex generator / tester
- JSON to XML converter and vice versa
- Base64 image converter
- SQL Data generator (using faker)

### Utility Tools
- Unit and currency converter
- Password generator / strength checker
- Unix timestamp converter
- Time zone converter
- Date / Time difference calculator
- Age calculator
- Typing speed test

## Tech Stack

### Frontend
- React.js with TypeScript
- Material-UI for UI components
- React Router for navigation
- Axios for API requests
- Framer Motion for animations

### Backend
- Laravel 11 with PHP 8.3
- MySQL database
- Laravel Sanctum for authentication
- Laravel Socialite for Google OAuth

## Project Structure

The project is structured as follows:

```
toolsbox/
├── toolsbox-frontend/     # React frontend
│   ├── public/            # Public assets
│   └── src/               # Source code
│       ├── components/    # Reusable components
│       ├── contexts/      # Context providers
│       ├── hooks/         # Custom hooks
│       ├── pages/         # Page components
│       ├── services/      # API services
│       └── utils/         # Utility functions
│
├── toolsbox-backend/      # Laravel backend
│   ├── app/               # Application code
│   ├── config/            # Configuration files
│   ├── database/          # Database migrations and seeders
│   ├── routes/            # API routes
│   └── storage/           # Storage for uploads and generated files
│
└── docker-compose.yml     # Docker Compose configuration
```

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js and npm (for local development)
- PHP 8.3 and Composer (for local development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/toolsbox.git
cd toolsbox
```

2. Start the Docker containers:
```bash
docker-compose up -d
```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
   - PHPMyAdmin: http://localhost:8080

### Local Development

#### Frontend
```bash
cd toolsbox-frontend
npm install --legacy-peer-deps
npm start
```

> **Note**: We use `--legacy-peer-deps` flag to resolve dependency conflicts with some packages that haven't been updated for React 18.

#### Backend
```bash
cd toolsbox-backend
composer install
php artisan key:generate
php artisan migrate
php artisan serve
```

## Authentication

The application uses Google OAuth for authentication. Users need to sign in to access all tools and features.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Material-UI](https://mui.com/)
- [React](https://reactjs.org/)
- [Laravel](https://laravel.com/)
- [Docker](https://www.docker.com/)
