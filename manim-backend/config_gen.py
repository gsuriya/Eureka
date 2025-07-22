import anthropic
import os
import dotenv
import base64
import httpx
import weave
import json
from typing import Optional
from smart_docs_loader import SmartManimDocsLoader

# Load environment variables from .env file
dotenv.load_dotenv()

API_KEY = os.getenv("ANTHROPIC_API_KEY", "your_api_key_here")

client = anthropic.Anthropic(
    api_key=API_KEY
)

def get_prompt():
    return f"""You are 3Blue1Brown himself - the master of mathematical visualization and educational content.

Generate a JSON for a 45-60 second video with exactly 4 clips that showcase INSANELY IMPRESSIVE visualizations.

🔥 MANDATORY VISUALIZATION REQUIREMENTS (NO EXCEPTIONS):
- EVERY SINGLE CLIP must contain complex graphs, networks, or mathematical visualizations
- NO SIMPLE CIRCLES OR BASIC SHAPES - Use complex interconnected systems only
- Use multiple interconnected nodes, flowing data, animated graphs, mathematical plots
- Create layered, sophisticated animations that build understanding step by step
- Make it look absolutely FIRE - impress with visual complexity and beauty
- Think 3Blue1Brown level of visual storytelling and mathematical elegance

🚫 FORBIDDEN SIMPLE ELEMENTS:
- Single circles, squares, or basic shapes
- Simple text animations without complex visuals
- Basic geometric shapes without connections
- Static elements without sophisticated animations

✅ REQUIRED COMPLEX ELEMENTS:
- Neural networks with flowing data between layers (minimum 9 nodes)
- Interactive graphs that transform and evolve
- Mathematical functions plotted in real-time
- Complex node networks with animated connections
- Multi-dimensional visualizations
- Sophisticated color schemes and smooth transitions

CLIP STRUCTURE (45-60 seconds total):
1. Introduction (10-15s): Complex network/graph intro with min. 12 interconnected nodes.
2. Core Concept (10-15s): Mathematical visualization with animated functions and plots.
3. Deep Mechanism (10-15s): Sophisticated animated explanation with transforming networks.
4. Advanced Insight (10-15s): High-level synthesis with complex data flow.
Ensure total duration is between 45 and 60 seconds.

CRITICAL LAYOUT RULES (NO EXCEPTIONS):
- ALL text elements (titles, labels, etc.) MUST be positioned using .to_edge(UP) or .to_edge(DOWN).
- ALL diagrams, graphs, and visualizations MUST be positioned in the center of the screen.
- NEVER allow text and diagrams to overlap. Use the screen edges for text and the center for visuals.

ADVANCED MANIM CAPABILITIES YOU MUST USE:
- NETWORKS: Complex node graphs with VGroup, animated connections, data flow
- MATHEMATICAL PLOTS: Functions, derivatives, integrals, 3D surfaces, parametric curves
- TRANSFORMATIONS: Morphing between different mathematical representations
- LAYERED ANIMATIONS: Multiple objects transforming simultaneously
- SOPHISTICATED COLORS: Gradients, opacity changes, color-coded systems
- DYNAMIC GRAPHS: Real-time plotting, animated function transformations

MODERN MANIM SYNTAX (CRITICAL):
- Use Create() instead of ShowCreation()
- Use axes.plot() instead of axes.get_graph()
- Use FadeIn() for reveals
- Use Transform() for morphing
- Use AnimationGroup() for complex coordinated animations
- Use VGroup() for organizing complex visualizations
- ALWAYS include "from manim import *" and "import numpy as np"
- Use proper variable scoping - define all variables before using them
- Avoid undefined variables like referencing objects from previous clips
- Use self.play() for all animations, self.wait() for pauses
- End every construct() method with self.wait(1)

ERROR PREVENTION RULES:
- Never reference variables from other clips (each clip is independent)
- Always define all objects within the same construct() method
- Use proper Manim syntax for all animations
- Avoid complex lambda functions that might cause errors
- Use simple, reliable Manim objects and methods
- Test all mathematical functions before using them
- Keep stroke_width, fill_opacity, and other parameters within valid ranges

MANDATORY COMPLEX CODE EXAMPLES YOU MUST FOLLOW:
```python
# EXAMPLE 1: Complex Neural Network (MINIMUM COMPLEXITY)
from manim import *
import numpy as np

class SimpleScene(Scene):
    def construct(self):
        title = Text("Neural Network Architecture", font_size=48).to_edge(UP)
        
        # Create 3 layers with multiple nodes
        layer1 = VGroup(*[Circle(radius=0.3, color=BLUE, fill_opacity=0.8) for _ in range(4)])
        layer1.arrange(DOWN, buff=0.5).shift(LEFT * 3)
        
        layer2 = VGroup(*[Circle(radius=0.3, color=PURPLE, fill_opacity=0.8) for _ in range(6)])
        layer2.arrange(DOWN, buff=0.4)
        
        layer3 = VGroup(*[Circle(radius=0.3, color=GREEN, fill_opacity=0.8) for _ in range(3)])
        layer3.arrange(DOWN, buff=0.6).shift(RIGHT * 3)
        
        # Create connections between layers
        connections = VGroup()
        for node1 in layer1:
            for node2 in layer2:
                line = Line(node1.get_center(), node2.get_center(), 
                          color=YELLOW, stroke_width=2, stroke_opacity=0.6)
                connections.add(line)
        
        for node1 in layer2:
            for node2 in layer3:
                line = Line(node1.get_center(), node2.get_center(), 
                          color=ORANGE, stroke_width=2, stroke_opacity=0.6)
                connections.add(line)
        
        self.play(Write(title))
        self.play(Create(layer1), Create(layer2), Create(layer3))
        self.play(Create(connections), run_time=2)
        
        # Animate data flow
        dots = VGroup(*[Dot(color=RED, radius=0.1).move_to(node.get_center()) for node in layer1])
        self.play(Create(dots))
        
        new_dots = VGroup(*[Dot(color=RED, radius=0.1).move_to(node.get_center()) for node in layer2])
        self.play(Transform(dots, new_dots), run_time=1)
        
        final_dots = VGroup(*[Dot(color=RED, radius=0.1).move_to(node.get_center()) for node in layer3])
        self.play(Transform(dots, final_dots), run_time=1)
        
        self.wait(1)

# EXAMPLE 2: Mathematical Function Visualization (MINIMUM COMPLEXITY)
from manim import *
import numpy as np

class SimpleScene(Scene):
    def construct(self):
        title = Text("Activation Functions", font_size=48).to_edge(UP)
        
        # Create axes
        axes = Axes(
            x_range=[-4, 4, 1],
            y_range=[-2, 2, 1],
            x_length=8,
            y_length=5,
            axis_config={"color": BLUE}
        )
        
        # Create function graphs
        sigmoid = axes.plot(lambda x: 2 / (1 + np.exp(-x)) - 1, color=RED, stroke_width=4)
        tanh = axes.plot(lambda x: np.tanh(x), color=GREEN, stroke_width=4)
        relu = axes.plot(lambda x: np.maximum(0, x), color=YELLOW, stroke_width=4)
        
        # Create labels
        sigmoid_label = Text("Sigmoid", font_size=24, color=RED).next_to(axes, RIGHT).shift(UP * 1)
        tanh_label = Text("Tanh", font_size=24, color=GREEN).next_to(axes, RIGHT)
        relu_label = Text("ReLU", font_size=24, color=YELLOW).next_to(axes, RIGHT).shift(DOWN * 1)
        
        self.play(Write(title))
        self.play(Create(axes))
        self.play(Create(sigmoid), Write(sigmoid_label))
        self.play(Create(tanh), Write(tanh_label))
        self.play(Create(relu), Write(relu_label))
        
        # Animate function transformations
        self.play(sigmoid.animate.set_color(PURPLE), run_time=1)
        self.play(tanh.animate.set_color(ORANGE), run_time=1)
        self.play(relu.animate.set_color(PINK), run_time=1)
        
        self.wait(1)

# EXAMPLE 3: Complex Network Graph (MINIMUM COMPLEXITY)
from manim import *
import numpy as np

class SimpleScene(Scene):
    def construct(self):
        title = Text("Network Graph", font_size=48).to_edge(UP)
        
        # Create central hub nodes
        center_nodes = VGroup()
        for i in range(6):
            angle = i * 2 * np.pi / 6
            pos = np.array([2 * np.cos(angle), 2 * np.sin(angle), 0])
            node = Circle(radius=0.3, color=BLUE, fill_opacity=0.8).move_to(pos)
            center_nodes.add(node)
        
        # Create outer nodes
        outer_nodes = VGroup()
        for i in range(12):
            angle = i * 2 * np.pi / 12
            pos = np.array([4 * np.cos(angle), 4 * np.sin(angle), 0])
            node = Circle(radius=0.2, color=GREEN, fill_opacity=0.6).move_to(pos)
            outer_nodes.add(node)
        
        # Create connections
        connections = VGroup()
        
        # Connect center nodes to each other
        for i in range(6):
            for j in range(i + 1, 6):
                line = Line(center_nodes[i].get_center(), center_nodes[j].get_center(),
                           color=YELLOW, stroke_width=2, stroke_opacity=0.5)
                connections.add(line)
        
        # Connect center nodes to outer nodes
        for center_node in center_nodes:
            for outer_node in outer_nodes:
                if np.linalg.norm(center_node.get_center() - outer_node.get_center()) < 3:
                    line = Line(center_node.get_center(), outer_node.get_center(),
                               color=ORANGE, stroke_width=1, stroke_opacity=0.4)
                    connections.add(line)
        
        self.play(Write(title))
        self.play(Create(center_nodes))
        self.play(Create(outer_nodes))
        self.play(Create(connections), run_time=3)
        
        # Animate network activity
        for _ in range(3):
            self.play(center_nodes.animate.set_color(RED), run_time=0.5)
            self.play(outer_nodes.animate.set_color(PURPLE), run_time=0.5)
            self.play(center_nodes.animate.set_color(BLUE), run_time=0.5)
            self.play(outer_nodes.animate.set_color(GREEN), run_time=0.5)
        
        self.wait(1)
```

🚨 CRITICAL REQUIREMENT: Every single clip MUST use complex visualizations like the examples above. NO SIMPLE SHAPES ALLOWED."""

def load_manim_documentation() -> str:
    """Load the scraped Manim documentation for enhanced code generation"""
    try:
        docs_path = os.path.join(os.path.dirname(__file__), "manim_docs_consolidated.txt")
        if os.path.exists(docs_path):
            with open(docs_path, 'r', encoding='utf-8') as f:
                full_docs = f.read()
            
            # Since the full documentation is very large, we'll extract key sections
            # that are most relevant for code generation
            key_sections = []
            
            # Extract sections that contain code examples and API references
            sections = full_docs.split("=== ")
            for section in sections:
                if any(keyword in section.lower() for keyword in [
                    'quickstart', 'example', 'animation', 'mobject', 'scene', 
                    'coordinate', 'graph', 'text', 'transform', 'surface',
                    'getting_started', 'structure'
                ]):
                    # Take first 2000 characters of relevant sections
                    key_sections.append(section[:2000])
            
            return "\n".join(key_sections)
        else:
            return "Manim documentation not found. Using basic configuration."
    except Exception as e:
        print(f"Error loading documentation: {e}")
        return "Error loading Manim documentation."

# Load documentation at startup
MANIM_DOCUMENTATION = load_manim_documentation()
smart_docs_loader = SmartManimDocsLoader()

@weave.op()
def generate_video_config_with_smart_docs(pdf_path, user_prompt="", use_base64=False):
    """Generate video configuration with smart documentation targeting"""
    
    # Get targeted documentation based on user prompt
    targeted_docs = smart_docs_loader.get_targeted_documentation(user_prompt)
    
    # Create a dynamic prompt with targeted documentation
    dynamic_prompt = f"""You are creating a simple, clean educational video from this research paper. 
Generate a JSON for a 45-60 second video with exactly 4 clips that are visually clean and easy to follow.

USER REQUEST: {user_prompt}

TARGETED MANIM DOCUMENTATION:
""" + targeted_docs + """

CRITICAL LAYOUT RULES:
- Title text always goes at the TOP (y=2.5 to 3)
- Main content in CENTER (y=-0.5 to 1.5)  
- Simple shapes ONLY in the center, never overlapping text
- Keep animations MINIMAL and SMOOTH
- Use clear spacing between elements

CLIP STRUCTURE (exactly 4 clips):
1. Introduction (12s): Present the problem/topic
2. Core Concept (12s): Main idea with simple visual
3. Key Mechanism (12s): How it works (basic shapes/arrows)
4. Impact/Result (12s): Why it matters

CRITICAL CODE REQUIREMENTS:
- Class name must be exactly "SimpleScene"
- Always start with a title using Text().to_edge(UP)
- Use self.wait() between animations (minimum 1 second)
- Create engaging, educational visualizations that enhance understanding
- Keep total animation time to exactly 12 seconds
- End every scene with self.wait(1)
- Use the documentation examples above as reference for proper syntax

VOICE-OVER STYLE:
- Conversational and clear
- Match the visual timing
- 2-3 sentences per clip maximum
- Natural pacing with pauses

Return ONLY this JSON (no markdown, no explanation):
{{
    "clips": [
        {{
            "type": "manim", 
            "code": "class SimpleScene(Scene):\\n    def construct(self):\\n        # Animation code here\\n        title = Text('Topic Title', font_size=48).to_edge(UP)\\n        self.play(Write(title))\\n        self.wait(1)\\n        # Add more elements here\\n        self.wait(1)",
            "voice_over": "Clear, concise narration matching the 12-second timing"
        }}
    ]
}}"""

    if use_base64:
        # Load PDF from URL and encode as base64
        if pdf_path.startswith('http'):
            pdf_data = base64.standard_b64encode(httpx.get(pdf_path).content).decode("utf-8")
        else:
            # Load from local file
            with open(pdf_path, "rb") as f:
                pdf_data = base64.standard_b64encode(f.read()).decode("utf-8")
        
        document_content = {
            "type": "document",
            "source": {
                "type": "base64",
                "media_type": "application/pdf",
                "data": pdf_data
            }
        }
    else:
        # Use URL method
        document_content = {
            "type": "document",
            "source": {
                "type": "url",
                "url": pdf_path
            }
        }
    
    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=8192,
        messages=[
            {
                "role": "user", 
                "content": [
                    document_content,
                    {
                        "type": "text",
                        "text": dynamic_prompt,
                    }
                ]
            },
        ]
    )

    return message

@weave.op()
def generate_video_config(pdf_path, use_base64=False):
    """Generate video configuration from PDF using Claude AI"""
    
    if use_base64:
        # Load PDF from URL and encode as base64
        if pdf_path.startswith('http'):
            pdf_data = base64.standard_b64encode(httpx.get(pdf_path).content).decode("utf-8")
        else:
            # Load from local file
            with open(pdf_path, "rb") as f:
                pdf_data = base64.standard_b64encode(f.read()).decode("utf-8")
        
        document_content = {
            "type": "document",
            "source": {
                "type": "base64",
                "media_type": "application/pdf",
                "data": pdf_data
            }
        }
    else:
        # Use URL method
        document_content = {
            "type": "document",
            "source": {
                "type": "url",
                "url": pdf_path
            }
        }
    
    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=8192,
        messages=[
            {
                "role": "user", 
                "content": [
                    document_content,
                    {
                        "type": "text",
                        "text": get_prompt(),
                    }
                ]
            },
        ]
    )

    return message

if __name__ == "__main__":
    # Example usage
    pdf_path = "./sample_paper.pdf"
    response = generate_video_config(pdf_path, use_base64=True)
    print(response.content[0].text)

    # Save to file
    with open("manim_video_config.json", "w") as f:
        f.write(response.content[0].text) 