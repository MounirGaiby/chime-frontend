# Chime AI Chat

A modern, responsive AI chat application built with Angular 17 and Material Design, featuring a sleek dark mode interface and real-time message streaming.

![Chime AI Chat Screenshot](screenshot.png)

## Features

- 🌙 Modern dark mode interface with cyberpunk-inspired design
- 💬 Real-time message streaming with Server-Sent Events (SSE)
- 📱 Fully responsive design for mobile and desktop
- 🔄 Multiple AI model support with model switching
- 📝 Markdown support for messages
- 🎨 Syntax highlighting for code blocks
- 🔐 JWT-based authentication
- 📚 Conversation history and management
- 🤔 AI reasoning display for transparency
- 📋 One-click message copying
- ⌨️ Keyboard shortcuts for better UX

## Tech Stack

- Angular 17
- Angular Material
- RxJS
- Marked (Markdown parsing)
- Highlight.js (Code syntax highlighting)
- Server-Sent Events (SSE)
- TypeScript
- SCSS

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Angular CLI (v17 or higher)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/MounirGaiby/chime-frontend
cd chime-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment files:
```bash
cp src/environments/environment.example.ts src/environments/environment.ts
cp src/environments/environment.example.ts src/environments/environment.development.ts
```

4. Update the environment files with your API configuration:
```typescript
export const environment = {
  production: false,
  apiUrl: 'your_api_url_here'
};
```

## Development

Start the development server:
```bash
ng serve
```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Building for Production

```bash
ng build --configuration production
```

The build artifacts will be stored in the `dist/` directory.

## Project Structure

```
src/
├── app/
│   ├── components/        # Shared components
│   ├── interfaces/        # TypeScript interfaces
│   ├── pages/            # Page components
│   │   └── chat/         # Chat feature module
│   ├── services/         # Angular services
│   └── app.component.ts  # Root component
├── assets/               # Static assets
├── environments/         # Environment configurations
└── styles/              # Global styles
```

## Features in Detail

### Authentication
- JWT-based authentication
- Automatic token refresh
- Secure route guards
- Persistent login state

### Chat Interface
- Real-time message streaming
- Multiple AI model support
- Conversation management
- Message history
- Code syntax highlighting
- Markdown rendering
- Copy message functionality
- AI reasoning display

### Responsive Design
- Mobile-first approach
- Adaptive layout
- Touch-friendly interface
- Sliding panel navigation
- Responsive typography

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Environment Variables

The application expects the following environment variables:

```typescript
export const environment = {
  production: boolean;
  apiUrl: string;
  // Add any additional environment variables here
};
```

## API Integration

The application expects a REST API with the following endpoints:

- POST `/api/login` - User authentication
- POST `/api/register` - User registration
- GET `/api/conversations` - List conversations
- POST `/api/conversations` - Create new conversation
- GET `/api/conversations/:id` - Get conversation details
- DELETE `/api/conversations/:id` - Delete conversation
- POST `/api/conversations/:id/chat` - Send message (SSE endpoint)
- GET `/api/models` - List available AI models

## Keyboard Shortcuts

- `Enter` - Send message
- `Shift + Enter` - New line in message
- `Esc` - Close side panel (mobile)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Known Issues

- SSE connections may timeout after extended periods
- Some Markdown elements might need additional styling
- Mobile keyboard might affect layout on some devices

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Angular team for the amazing framework
- Material Design team for the UI components
- The open-source community for various tools and libraries

## Contact

Project Link: [https://github.com/MounirGaiby/chime-frontend](https://github.com/MounirGaiby/chime-frontend)
```

This README provides:
1. Clear project overview
2. Installation instructions
3. Development setup
4. Feature documentation
5. Project structure
6. Contributing guidelines
7. Environment configuration
8. API documentation
9. Browser support
10. Known issues
11. License information

You should customize it with:
1. Your actual repository URLs
2. Your contact information
3. Specific environment variables
4. Any additional features or requirements
5. Screenshots of your application
6. Specific deployment instructions if needed
