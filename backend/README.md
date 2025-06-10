# Backend API

This is a Node.js/Express backend API that uses the Google Gemini AI API for content generation and chat functionality.

## Features

- **Template Detection**: Automatically determines if a project should use React or Node.js based on user prompts
- **Chat Interface**: Provides a conversational AI interface using the Gemini API
- **Modern API**: Uses the latest `@google/genai` package (migrated from deprecated `@google/generative-ai`)

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Build and Run**:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run build
   npm start
   ```

## API Endpoints

### POST /template
Determines the project type (React or Node.js) based on user input.

**Request Body**:
```json
{
  "prompt": "Create a web application with a modern UI"
}
```

**Response**:
```json
{
  "prompts": ["base_prompt", "specific_prompt"],
  "uiPrompts": ["ui_specific_prompt"]
}
```

### POST /chat
Provides conversational AI responses using the Gemini API.

**Request Body**:
```json
{
  "messages": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi there!" },
    { "role": "user", "content": "How are you?" }
  ]
}
```

**Response**:
```json
{
  "response": "I am doing well, thank you for asking!"
}
```

## Testing

Run the test suite:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Migration Notes

This project has been migrated from the deprecated `@google/generative-ai` package to the new `@google/genai` package. Key changes include:

- Updated to use `gemini-2.5-flash` model
- Simplified API structure with direct method calls
- Improved TypeScript support
- Better error handling

See `MIGRATION.md` for detailed migration information.

## Dependencies

- **Express**: Web framework
- **@google/genai**: Google Gemini AI API client
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management

## Development Dependencies

- **TypeScript**: Type checking and compilation
- **Jest**: Testing framework
- **Supertest**: HTTP assertion library
- **ts-jest**: TypeScript preprocessor for Jest
