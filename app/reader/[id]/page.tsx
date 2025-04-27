"use client"

import { useState, useRef, useEffect } from "react"
import { use } from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Key,
  Lightbulb,
  Menu,
  Save,
  Share,
  Sparkles,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PapersSidebar } from "@/components/papers-sidebar"
import { PaperTabs } from "@/components/paper-tabs"
import { PDFViewer } from "@/components/pdf-viewer"

// Mock paper data
const paperData = {
  "1": {
    id: "1",
    title: "Attention Is All You Need",
    authors:
      "Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin",
    abstract:
      "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results, including ensembles, by over 2 BLEU. On the WMT 2014 English-to-French translation task, our model establishes a new single-model state-of-the-art BLEU score of 41.8 after training for 3.5 days on eight GPUs, a small fraction of the training costs of the best models from the literature. We show that the Transformer generalizes well to other tasks by applying it successfully to English constituency parsing both with large and limited training data.",
    year: "2017",
    venue: "NeurIPS",
    url: "https://arxiv.org/abs/1706.03762",
    sections: [
      {
        title: "Introduction",
        content:
          "Recurrent neural networks, long short-term memory and gated recurrent neural networks in particular, have been firmly established as state of the art approaches in sequence modeling and transduction problems such as language modeling and machine translation. Numerous efforts have been made to improve recurrent neural networks by addressing their fundamental constraint of sequential computation that prevents parallelization within training examples.\n\nAttention mechanisms have become an integral part of compelling sequence modeling and transduction models in various tasks, allowing modeling of dependencies without regard to their distance in the input or output sequences. In all but a few cases, however, such attention mechanisms are used in conjunction with a recurrent network.\n\nIn this work we propose the Transformer, a model architecture eschewing recurrence and instead relying entirely on an attention mechanism to draw global dependencies between input and output. The Transformer allows for significantly more parallelization and can reach a new state of the art in translation quality after being trained for as little as twelve hours on eight P100 GPUs.",
      },
      {
        title: "Model Architecture",
        content:
          "Most competitive neural sequence transduction models have an encoder-decoder structure. Here, the encoder maps an input sequence of symbol representations (x₁, ..., xₙ) to a sequence of continuous representations z = (z₁, ..., zₙ). Given z, the decoder then generates an output sequence (y₁, ..., yₘ) of symbols one element at a time. At each step the model is auto-regressive, consuming the previously generated symbols as additional input when generating the next.\n\nThe Transformer follows this overall architecture using stacked self-attention and point-wise, fully connected layers for both the encoder and decoder, shown in the left and right halves of Figure 1, respectively.",
      },
    ],
  },
  "2": {
    id: "2",
    title: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
    authors: "Jacob Devlin, Ming-Wei Chang, Kenton Lee, Kristina Toutanova",
    abstract:
      "We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers. As a result, the pre-trained BERT model can be fine-tuned with just one additional output layer to create state-of-the-art models for a wide range of tasks, such as question answering and language inference, without substantial task-specific architecture modifications. BERT is conceptually simple and empirically powerful. It obtains new state-of-the-art results on eleven natural language processing tasks, including pushing the GLUE score to 80.5% (7.7% point absolute improvement), MultiNLI accuracy to 86.7% (4.6% absolute improvement), SQuAD v1.1 question answering Test F1 to 93.2 (1.5 point absolute improvement) and SQuAD v2.0 Test F1 to 83.1 (5.1 point absolute improvement).",
    year: "2019",
    venue: "NAACL",
    url: "https://arxiv.org/abs/1810.04805",
    sections: [
      {
        title: "Introduction",
        content:
          "Language model pre-training has been shown to be effective for improving many natural language processing tasks. These include sentence-level tasks such as natural language inference and paraphrasing, which aim to predict the relationships between sentences by analyzing them holistically, as well as token-level tasks such as named entity recognition and question answering, where models are required to produce fine-grained output at the token level.\n\nThere are two existing strategies for applying pre-trained language representations to downstream tasks: feature-based and fine-tuning. The feature-based approach, such as ELMo, uses task-specific architectures that include the pre-trained representations as additional features. The fine-tuning approach, such as the Generative Pre-trained Transformer (OpenAI GPT), introduces minimal task-specific parameters, and is trained on the downstream tasks by simply fine-tuning all pretrained parameters. The two approaches share the same objective function during pre-training, where they use unidirectional language models to learn general language representations.",
      },
      {
        title: "Related Work",
        content:
          "There is a long history of pre-training in NLP. Word embeddings have been pre-trained using various methods and then used as inputs to downstream tasks. Pre-trained word embeddings are an integral part of modern NLP systems, offering significant improvements over embeddings learned from scratch.\n\nELMo and its predecessor take unidirectional language models a step further, by extracting context-sensitive features from a left-to-right and a right-to-left language model. The contextual representations of each token are constructed by concatenating the left-to-right and the right-to-left representations. When integrating contextual word embeddings with existing task-specific architectures, ELMo advances the state of the art for several major NLP benchmarks.",
      },
    ],
  },
  "3": {
    id: "3",
    title: "GPT-3: Language Models are Few-Shot Learners",
    authors:
      "Tom B. Brown, Benjamin Mann, Nick Ryder, Melanie Subbiah, Jared Kaplan, Prafulla Dhariwal, Arvind Neelakantan, Pranav Shyam, Girish Sastry, Amanda Askell, Sandhini Agarwal, Ariel Herbert-Voss, Gretchen Krueger, Tom Henighan, Rewon Child, Aditya Ramesh, Daniel M. Ziegler, Jeffrey Wu, Clemens Winter, Christopher Hesse, Mark Chen, Eric Sigler, Mateusz Litwin, Scott Gray, Benjamin Chess, Jack Clark, Christopher Berner, Sam McCandlish, Alec Radford, Ilya Sutskever, Dario Amodei",
    abstract:
      "Recent work has demonstrated substantial gains on many NLP tasks and benchmarks by pre-training on a large corpus of text followed by fine-tuning on a specific task. While typically task-agnostic in architecture, this method still requires task-specific fine-tuning datasets of thousands or tens of thousands of examples. By contrast, humans can generally perform a new language task from only a few examples or from simple instructions - something which current NLP systems still largely struggle to do. Here we show that scaling up language models greatly improves task-agnostic, few-shot performance, sometimes even reaching competitiveness with prior state-of-the-art fine-tuning approaches. Specifically, we train GPT-3, an autoregressive language model with 175 billion parameters, 10x more than any previous non-sparse language model, and test its performance in the few-shot setting. For all tasks, GPT-3 is applied without any gradient updates or fine-tuning, with tasks and few-shot demonstrations specified purely via text interaction with the model. GPT-3 achieves strong performance on many NLP datasets, including translation, question-answering, and cloze tasks, as well as several tasks that require on-the-fly reasoning or domain adaptation, such as unscrambling words, using a novel word in a sentence, or performing 3-digit arithmetic. At the same time, we also identify some datasets where GPT-3's few-shot learning still struggles, as well as some datasets where GPT-3 faces methodological issues related to training on large web corpora. Finally, we find that GPT-3 can generate samples of news articles which human evaluators have difficulty distinguishing from articles written by humans. We discuss broader societal impacts of this finding and of GPT-3 in general.",
    year: "2020",
    venue: "NeurIPS",
    url: "https://arxiv.org/abs/2005.14165",
    sections: [
      {
        title: "Introduction",
        content:
          "Recent years have featured a trend towards pre-trained language representations in NLP systems, applied in increasingly flexible and task-agnostic ways for downstream transfer. First, single-layer representations were learned using word vectors and fed to task-specific architectures. Then contextual representations were learned using language models (LMs), still requiring task-specific architectures. More recently, task-specific architectures have been replaced by pre-trained architectures, where the same architecture is used for pre-training and for downstream tasks, with minimal parameter additions. The most recent trend has been towards task-agnostic pre-training, where the same pre-trained model can be directly fine-tuned for many downstream tasks without architecture modification.\n\nIn this paper we test a different approach: we train a language model on a diverse corpus of text, but then evaluate its performance on tasks that it was not specifically trained for, either with no examples or just a few examples to provide context for the task.",
      },
      {
        title: "Approach",
        content:
          "Our basic pre-training approach, including model, data, and training, follows the work on language models in the previous literature. Unlike prior work, we focus on the performance of these models in the zero-shot, one-shot, and few-shot settings. We evaluate zero-shot performance by presenting the model with a natural language instruction or 'prompt' that describes the task and then directly evaluating performance on the task. For one-shot and few-shot learning, we present the model with one or a few examples of the task at inference time as conditioning, but importantly, no weight updates are allowed.\n\nWe evaluate on a large set of tasks drawn from the NLP literature. We try to select tasks that are representative of tasks that are challenging for current NLP systems and also diverse. We include tasks of question answering, translation, commonsense reasoning, reading comprehension, and several others.",
      },
    ],
  },
}

// Mock open papers
const initialOpenPapers = [
  { id: "1", title: "Attention Is All You Need" },
  { id: "2", title: "BERT: Pre-training of Deep Bidirectional Transformers" },
]

export default function ReaderPage({ params }: { params: { id: string } }) {
  // Unwrap params using React.use
  const unwrappedParams = use(params);
  const paperId = unwrappedParams.id;
  
  const [paper, setPaper] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hasApiKey, setHasApiKey] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [selectedText, setSelectedText] = useState("")
  const [aiExplanation, setAiExplanation] = useState("")
  const [showExplanation, setShowExplanation] = useState(false)
  const [savedHighlights, setSavedHighlights] = useState<string[]>([])
  const [showSidebar, setShowSidebar] = useState(true)
  const [activePaperId, setActivePaperId] = useState(paperId || "1")
  const [openPapers, setOpenPapers] = useState<Array<{ id: string; title: string }>>([])

  const selectionRef = useRef<{ x: number; y: number } | null>(null)
  const { toast } = useToast()

  // Fetch paper data from API
  useEffect(() => {
    const fetchPaper = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/papers/${paperId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch paper')
        }
        const data = await response.json()
        setPaper(data.paper)
        
        // Add to open papers if not already there
        setOpenPapers(prev => {
          if (!prev.some(p => p.id === data.paper._id.toString())) {
            return [...prev, { id: data.paper._id.toString(), title: data.paper.title }]
          }
          return prev
        })
        
        setActivePaperId(data.paper._id)
      } catch (error) {
        console.error('Error fetching paper:', error)
        toast({
          title: 'Error',
          description: 'Failed to load paper. Please try again.',
          variant: 'destructive',
        })
        // Use mock data as fallback
        const mockPaper = paperData[paperId as keyof typeof paperData]
        if (mockPaper) {
          setPaper(mockPaper)
          setOpenPapers(initialOpenPapers)
        }
      } finally {
        setLoading(false)
      }
    }

    if (paperId) {
      fetchPaper()
    }
  }, [paperId, toast])

  // Function to handle text selection and create highlights
  const handleTextSelection = (currentPage: number) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    try {
      // Get the selected text
      const text = selection.toString().trim();
      if (!text) return;

      // Get the bounding client rect of the selection
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      if (!rect.width || !rect.height) return;

      // Get page element
      const pageElement = pageRefs.current[currentPage - 1];
      if (!pageElement) {
        console.error("Page element reference not available");
        return;
      }

      // Get the page's position
      const pageRect = pageElement.getBoundingClientRect();
      
      // Calculate position relative to the page
      const relativeRect = {
        x1: rect.left - pageRect.left,
        y1: rect.top - pageRect.top,
        x2: rect.right - pageRect.left,
        y2: rect.bottom - pageRect.top,
        width: rect.width,
        height: rect.height,
      };

      // Check for overlapping highlights
      const hasOverlap = highlights.some(h => {
        if (h.page !== currentPage) return false;
        
        // Basic overlap detection
        const r1 = h.position.boundingRect;
        const r2 = relativeRect;
        
        return !(
          r1.x1 > r2.x2 || // r1 is to the right of r2
          r1.x2 < r2.x1 || // r1 is to the left of r2
          r1.y1 > r2.y2 || // r1 is below r2
          r1.y2 < r2.y1    // r1 is above r2
        );
      });

      if (hasOverlap) {
        console.log("Highlight overlaps with existing highlight, skipping");
        return;
      }

      // Create a highlight object
      const highlight: Highlight = {
        page: currentPage,
        position: {
          boundingRect: relativeRect,
          text,
        },
      };

      // Get document context for better summaries
      let context = "";
      try {
        const textLayerElements = pageElement.querySelectorAll(".react-pdf__Page__textContent");
        if (textLayerElements.length > 0) {
          const texts = Array.from(textLayerElements)
            .map(el => el.textContent || "")
            .filter(text => text.trim().length > 0);
          context = texts.join(" ");
        }
      } catch (error) {
        console.error("Error extracting context from page:", error);
      }

      // Calculate popup position relative to the highlight within the page
      const popupX = relativeRect.x2 + 10; // 10px to the right of highlight
      const popupY = relativeRect.y1; // Aligned with top of highlight
      
      // Check if popup would go off-screen and adjust if needed
      const pageWidth = pageRect.width;
      const popupWidth = 400; // Width of popup including margins
      
      // If popup would go beyond page edge, position left of highlight
      const adjustedX = popupX + popupWidth > pageWidth
        ? Math.max(10, relativeRect.x1 - popupWidth - 10)
        : popupX;

      // Add the highlight and immediately show popup
      setHighlights(prev => {
        const newHighlights = [...prev, highlight];
        
        // After adding the highlight, show popup immediately
        setPopup({
          visible: true,
          highlight: {
            ...highlight,
            context: context || undefined
          },
          position: {
            x: adjustedX,
            y: popupY
          }
        });
        
        return newHighlights;
      });
      
      console.log("Created highlight:", highlight);
      
      // Clear the selection
      selection.removeAllRanges();
    } catch (error) {
      console.error("Error creating highlight:", error);
    }
  };

  const saveHighlight = () => {
    if (selectedText && !savedHighlights.includes(selectedText)) {
      setSavedHighlights([...savedHighlights, selectedText])
      toast({
        title: "Highlight saved",
        description: "Added to your long-term memory.",
      })
    }
  }

  const saveApiKey = () => {
    if (apiKey.trim()) {
      setHasApiKey(true)
      toast({
        title: "API Key saved",
        description: "You can now use AI explanations when highlighting text.",
      })
    }
  }

  const handlePaperSelect = (id: string) => {
    // If paper is already open, just activate it
    if (openPapers.some((paper) => paper.id === id)) {
      setActivePaperId(id)
    } else {
      // Otherwise, add it to open papers and activate it
      const paperToAdd = {
        id,
        title: paperData[id as keyof typeof paperData]?.title || "Unknown Paper",
      }
      setOpenPapers([...openPapers, paperToAdd])
      setActivePaperId(id)
    }
  }

  const handleTabChange = (id: string) => {
    setActivePaperId(id)
  }

  const handleTabClose = (id: string) => {
    // Remove the paper from open papers
    const newOpenPapers = openPapers.filter((paper) => paper.id !== id)
    setOpenPapers(newOpenPapers)

    // If we're closing the active paper, activate another one
    if (id === activePaperId && newOpenPapers.length > 0) {
      setActivePaperId(newOpenPapers[0].id)
    }
  }

  // Effect to handle sidebar on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowSidebar(true)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-gray-600">Loading paper...</h2>
        </div>
      </div>
    )
  }

  // Show not found state
  if (!paper) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Paper not found</h1>
          <p className="text-gray-500 mb-6">The requested paper could not be found.</p>
          <Link href="/upload">
            <Button>Upload a Paper</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Display the PDF if filePath exists
  return (
    <div className="flex flex-col min-h-screen bg-ivory">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b bg-white shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setShowSidebar(!showSidebar)}>
              <Menu className="h-5 w-5" />
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-royal-500 p-1.5 rounded-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-royal-500 hidden md:inline">
                PaperMind
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {/* Download Button */}
            {paper.filePath && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a 
                      href={paper.filePath} 
                      download={paper.originalName || 'paper.pdf'}
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="icon" className="border-gray-200 shadow-sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>Download PDF</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Share Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="border-gray-200 shadow-sm">
                    <Share className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Memory Button */}
            <Link href="/memory">
              <Button
                variant="default"
                className="bg-royal-500 hover:bg-royal-600 text-white"
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                Memory
              </Button>
            </Link>

            {/* API Key Section */}
            {!hasApiKey && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="border-gray-200 shadow-sm">
                    <Key className="mr-2 h-4 w-4" />
                    Add API Key
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">OpenAI API Key</h4>
                      <p className="text-sm text-gray-500">Add your API key to enable AI explanations.</p>
                    </div>
                    <div className="grid gap-2">
                      <Input
                        id="api-key"
                        placeholder="sk-..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="focus-royal-blue"
                      />
                      <Button size="sm" className="bg-royal-500 hover:bg-royal-600" onClick={saveApiKey}>
                        Save Key
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </header>

      {/* Paper Tabs */}
      <PaperTabs
        papers={openPapers}
        activePaperId={activePaperId}
        onTabChange={handleTabChange}
        onTabClose={handleTabClose}
      />

      {/* Main Content with Sidebar */}
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <PapersSidebar
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
          activePaperId={activePaperId}
          onPaperSelect={handlePaperSelect}
        />

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-200 ${showSidebar ? "md:ml-72" : ""}`}>
          <main className="py-8">
            <div className="container max-w-7xl mx-auto px-4">
              {/* Paper Metadata */}
              <div className="mb-8 space-y-4">
                <h1 className="text-3xl font-serif font-bold">{paper.title}</h1>
                {paper.authors && paper.authors.length > 0 && (
                  <div className="text-gray-500">
                    <p>{Array.isArray(paper.authors) ? paper.authors.join(', ') : paper.authors}</p>
                    {paper.venue && paper.year && (
                      <p className="mt-1">
                        {paper.venue}, {paper.year}
                      </p>
                    )}
                  </div>
                )}
                {paper.url && (
                  <div className="flex items-center gap-2">
                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center"
                    >
                      View original paper <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* PDF Viewer for uploaded PDFs - full width container */}
              {paper.filePath && (
                <div className="mb-8 w-full">
                  <PDFViewer 
                    url={paper.filePath} 
                    fileName={paper.originalName || paper.title} 
                  />
                </div>
              )}

              {/* Abstract */}
              {paper.abstract && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Abstract</h2>
                  <div className="text-gray-700 leading-relaxed bg-white p-6 rounded-lg border shadow-sm">
                    {paper.abstract}
                  </div>
                </div>
              )}

              {/* Paper Content - only show for mock data or extracted content */}
              {paper.sections && paper.sections.length > 0 && (
                <div className="space-y-8" onMouseUp={() => handleTextSelection(currentPage)}>
                  {paper.sections.map((section: any, index: number) => (
                    <div key={index} className="space-y-4">
                      <h2 className="text-xl font-semibold text-gray-800">{section.title}</h2>
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line bg-white p-6 rounded-lg border shadow-sm">
                        {section.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Selection Popover */}
      {selectedText && selectionRef.current && (
        <div
          className="fixed z-50 bg-white shadow-lg rounded-lg p-2 flex gap-2"
          style={{
            left: `${selectionRef.current.x}px`,
            top: `${selectionRef.current.y + 10}px`,
            transform: "translateX(-50%)",
          }}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={saveHighlight}>
                  <Save className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save to Memory</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {hasApiKey && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => setShowExplanation(!showExplanation)}>
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Explain with AI</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}

      {/* AI Explanation Card */}
      {showExplanation && aiExplanation && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md">
          <Card className="p-4 shadow-lg border border-royal-100">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-royal-500" />
                <h3 className="font-medium">AI Explanation</h3>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowExplanation(false)}>
                <span className="sr-only">Close</span>
                <span>×</span>
              </Button>
            </div>
            <p className="text-sm">{aiExplanation}</p>
          </Card>
        </div>
      )}
    </div>
  )
}
