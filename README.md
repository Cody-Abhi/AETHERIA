# Aetheria - Your Personal AI Assistant

![Aetheria Logo](./src/logo.png)

Aetheria is an advanced AI assistant built with Next.js, Gemini, and React, designed to provide seamless task management, personalized recommendations, and intelligent assistance. With its intuitive interface and powerful backend, Aetheria helps you stay organized, productive, and connected.

## Features

- **Smart Task Management**: Create, track, and manage your daily tasks with ease.
- **AI-Powered Recommendations**: Get personalized suggestions based on your preferences and activities.
- **Interactive Chat Interface**: Communicate with Aetheria through a dynamic and responsive chat.
- **Cross-Platform Support**: Runs on web, mobile, and desktop thanks to Next.js.
- **Modern UI/UX**: Built with Tailwind CSS for a beautiful and responsive design.

## Getting Started

### Prerequisites

- **Node.js**: version 18 or higher
- **npm**: version 9 or higher
- **Google Gemini API Key**: Get one from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd aetheria
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following content:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000` to access Aetheria.

## Usage

- **Create Tasks**: Click the "Add Task" button to create new tasks.
- **Chat**: Use the chat interface on the right to interact with Aetheria.
- **Settings**: Access settings to customize your experience.

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) 16
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **AI**: [Google Gemini API](https://ai.google.dev/)
- **State Management**: React Hooks + Context API
- **Deployment**: Vercel (via AI Studio)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to [Google](https://www.google.com/) for the Gemini API
- Built with the power of [Next.js](https://nextjs.org/)

## Support

If you encounter any issues or have questions, please feel free to open an issue in the repository.

---