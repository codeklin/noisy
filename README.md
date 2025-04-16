# Postit - Social Media Content Generator

![Postit Logo](public/logo.svg)

Postit is a powerful AI-powered social media content generator that helps you create engaging, viral content for multiple platforms. With Postit, you can save hours of work by generating a month's worth of content in minutes.

## Features

- **AI-Powered Content**: Generate engaging posts with advanced AI technology
- **Viral Strategies**: Implement proven tactics that boost engagement
- **Save Hours Weekly**: Create a month of content in minutes, not days
- **Premium Results**: Get professional-quality content every time

## Technologies Used

This project is built with modern web technologies:

- **React**: Frontend library for building user interfaces
- **TypeScript**: Type-safe JavaScript for better development experience
- **Vite**: Next-generation frontend tooling for faster development
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **shadcn/ui**: High-quality UI components built with Radix UI and Tailwind
- **Framer Motion**: Animation library for React
- **React Router**: Routing library for React applications
- **Supabase**: Backend-as-a-Service for authentication and database
- **React Query**: Data fetching and state management library

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/codeklin/content-crafter-calendar.git

# Navigate to the project directory
cd content-crafter-calendar

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:8080`.

## Environment Variables

To use the AI features, you'll need to set up the following environment variables in a `.env` file:

```env
HUGGINGFACE_API_KEY=your_huggingface_api_key
GEMINI_API_KEY=your_gemini_api_key
TOGETHER_API_KEY=your_together_api_key
```

## Building for Production

```bash
# Build the application
npm run build

# Preview the production build locally
npm run preview
```

## Project Structure

```text
/public          # Static assets
/src
  /components    # Reusable UI components
  /context       # React context providers
  /hooks         # Custom React hooks
  /lib           # Utility functions and helpers
  /pages         # Page components
  /types         # TypeScript type definitions
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
