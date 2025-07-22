# 📚 Paper Trail - Unified Research Assistant Platform

A complete research assistant platform that combines paper reading, AI-powered analysis, video generation, and knowledge graph management in one integrated system.

## 🎯 Features

### 🎬 **Video Generation**
- Create educational videos from paper content using Manim animations
- AI-generated narration with LMNT voice synthesis (Edge TTS fallback)
- **Audio-enabled videos** with FFmpeg stream preservation
- Real-time job status tracking and video player integration

### 📊 **Knowledge Graph Generation**
- Extract key concepts from papers and add to memory graphs
- Semantic connections using OpenAI embeddings and cosine similarity
- Interactive workflow for configuring graph generation
- Visual graph exploration with Cytoscape.js

### 🧠 **Memory Copilot**
- Semantic search across your research papers
- AI-powered concept explanation and analysis
- Context-aware responses using paper content and graph data
- Integration with Gemini for advanced reasoning

### 📖 **Paper Management**
- PDF viewer with highlighting and annotation
- Paper library with search and organization
- Project-based paper categorization
- Quiz generation from paper content

## 🏗️ Architecture

```
paper-trail-unified/
├── 📁 Frontend (Next.js)
│   ├── app/                    # Next.js 13+ app router
│   ├── components/             # React components
│   ├── lib/                    # Utilities and configs
│   └── public/                 # Static assets
│
├── 📁 manim-backend/           # Video Generation Backend
│   ├── server.py              # FastAPI server
│   ├── video_generator.py     # Manim video creation
│   ├── voice_gen.py           # Audio generation
│   └── requirements.txt       # Python dependencies
│
└── 📁 Database Integration
    └── MongoDB for papers, memory graphs, and user data
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.8+
- MongoDB instance
- OpenAI API key (for embeddings)
- Google Gemini API key (for AI responses)
- LMNT API key (optional, for premium voice)

### 1. Frontend Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Configure your .env.local:
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
MONGODB_URI=your_mongodb_connection
MANIM_SERVER_URL=http://localhost:8000
```

```bash
# Start the frontend
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 2. Video Generation Backend Setup

```bash
# Navigate to manim backend
cd manim-backend

# Create Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install system dependencies (macOS)
brew install cairo pkg-config ffmpeg

# Start the backend server
python server.py
```

The backend will be available at `http://localhost:8000`

## 🛠️ Usage Guide

### 📚 **Paper Management**
1. Upload PDFs through the library interface
2. Papers are automatically processed and stored
3. Use the reader to view and highlight content
4. Organize papers into projects

### 🎬 **Video Generation**
1. Open a paper in the reader
2. Click the copilot chat button
3. Select "Video Generation" tool
4. Enter a prompt describing the video content
5. Wait for generation (typically 2-5 minutes)
6. Videos include both visual animations and audio narration

### 📊 **Knowledge Graphs**
1. Select "Graph Generation" tool in copilot
2. Specify the topic you want to extract
3. Choose number of clips to generate (1-20)
4. Select target memory graph
5. New concepts are added with semantic connections

### 💬 **Research Chat**
1. Use the copilot chat for any research questions
2. AI has access to paper content and memory graphs
3. Ask about methodologies, findings, or concepts
4. Get context-aware explanations

## 🔧 Configuration

### Environment Variables

```bash
# Required APIs
GOOGLE_GENERATIVE_AI_API_KEY=      # Gemini for AI responses
OPENAI_API_KEY=                    # OpenAI for embeddings
MONGODB_URI=                       # MongoDB connection

# Optional APIs
LMNT_API_KEY=                      # Premium voice synthesis
BROWSERBASE_API_KEY=              # Web search capabilities
BROWSERBASE_PROJECT_ID=

# Server Configuration
MANIM_SERVER_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend Configuration (manim-backend/.env)

```bash
LMNT_API_KEY=your_lmnt_key        # Optional premium voice
WANDB_API_KEY=your_wandb_key      # Optional tracking
```

## 🧪 Testing

### Frontend Testing
```bash
npm run test
npm run lint
npm run type-check
```

### Backend Testing
```bash
cd manim-backend
python test_audio_verification.py  # Test audio pipeline
python debug_video_generation.py   # Test video generation
```

## 📊 Technology Stack

### Frontend
- **Next.js 13+** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **PDF.js** for document viewing
- **Cytoscape.js** for graph visualization

### Backend
- **FastAPI** for video generation API
- **Manim** for mathematical animations
- **MoviePy** for video processing
- **LMNT** for premium voice synthesis
- **Edge TTS** for fallback voice generation
- **FFmpeg** for audio/video stream handling

### Database & AI
- **MongoDB** for data storage
- **OpenAI Embeddings** for semantic similarity
- **Google Gemini** for AI responses
- **W&B Weave** for tracking (optional)

## 🔍 Key Features Deep Dive

### Video Generation with Working Audio
- Fixed the critical audio loss issue using FFmpeg stream preservation
- Supports both LMNT premium voices and Edge TTS fallback
- Real-time job polling with status updates
- Comprehensive audio pipeline logging for debugging

### Semantic Knowledge Graphs
- Automatic concept extraction from papers
- Cosine similarity calculations for semantic connections
- Interactive graph visualization and exploration
- Memory persistence across sessions

### Advanced AI Integration
- Context-aware responses using paper content
- Graph data integration for enhanced reasoning
- Multi-modal document processing (PDF + text)
- Fallback mechanisms for robust operation

## 🚨 Troubleshooting

### Video Generation Issues
1. **No Audio**: Ensure FFmpeg is installed and accessible
2. **Generation Fails**: Check manim backend logs and dependencies
3. **API Errors**: Verify LMNT key and check rate limits

### Graph Generation Issues
1. **Empty Graphs**: Check OpenAI API key and embedding generation
2. **No Connections**: Verify similarity threshold settings
3. **Processing Errors**: Check Gemini API key and PDF access

### General Issues
1. **Database Errors**: Verify MongoDB connection and permissions
2. **API Timeouts**: Check network connectivity and API limits
3. **Memory Issues**: Monitor system resources during video generation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Manim Community** for the animation framework
- **OpenAI** for embeddings and language models
- **Google** for Gemini AI integration
- **LMNT** for high-quality voice synthesis
- **Vercel** for Next.js framework

---

## 📞 Support

For issues and support:
1. Check the troubleshooting section above
2. Search existing GitHub issues
3. Create a new issue with detailed reproduction steps
4. Include logs and system information

**Happy researching! 🚀**