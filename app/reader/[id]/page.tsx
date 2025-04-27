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

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim().length > 0) {
      const text = selection.toString().trim()
      setSelectedText(text)

      // Get position for popover
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      selectionRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.bottom,
      }

      // If API key is set, automatically get explanation
      if (hasApiKey) {
        // Simulate AI explanation
        setTimeout(() => {
          setAiExplanation(
            `This concept refers to ${text.toLowerCase().includes("attention") ? "the attention mechanism which allows the model to focus on different parts of the input sequence when generating each part of the output" : "a key component of the architecture discussed in this paper"}.`,
          )
          setShowExplanation(true)
        }, 500)
      }
    } else {
      setSelectedText("")
      setShowExplanation(false)
    }
  }

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
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <PapersSidebar 
        show={showSidebar} 
        onClose={() => setShowSidebar(false)} 
        onPaperSelect={handlePaperSelect}
        highlights={savedHighlights}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with tabs */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="container mx-auto flex items-center justify-between py-2 px-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSidebar(!showSidebar)}
                className="mr-2"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <PaperTabs
                papers={openPapers}
                activePaperId={activePaperId}
                onTabChange={handleTabChange}
                onTabClose={handleTabClose}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={paper?.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-royal-500 hover:text-royal-600"
                    >
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="h-5 w-5" />
                      </Button>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Visit source</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Download className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download paper</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Share className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share paper</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Key className="h-5 w-5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-4">
                          <h3 className="font-medium">Add Your API Key</h3>
                          <p className="text-sm text-gray-500">
                            Enable AI explanations by adding your API key.
                          </p>
                          <div className="flex space-x-2">
                            <Input
                              type="password"
                              placeholder="API Key"
                              value={apiKey}
                              onChange={(e) => setApiKey(e.target.value)}
                            />
                            <Button onClick={saveApiKey}>Save</Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Set API Key</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </header>

        {/* Paper content */}
        <main className="flex-1 overflow-auto bg-ivory-50">
          <div className="container mx-auto py-8 px-4">
            {paper && paper.filePath ? (
              <PDFViewer url={paper.filePath} fileName={paper.title} paperId={paper._id?.toString() || paperId} />
            ) : (
              <>
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
                  <div className="space-y-8" onMouseUp={handleTextSelection}>
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
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
