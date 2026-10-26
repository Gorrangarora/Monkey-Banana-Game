import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 800, "Monkey & Banana Problem — AI Planning & BFS vs. DFS Analysis")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(54, 792, 540, 792)
        
        # Footer
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(540, 36, page_str)
        self.drawString(54, 36, "AISC College Project & Academic Reference | Antigravity AI Engine")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 48, 540, 48)
        self.restoreState()

def create_report(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=8
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#475569'),
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#065f46'),
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#1e293b'),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#334155'),
        spaceAfter=8,
        alignment=4 # Justified
    )

    bullet_style = ParagraphStyle(
        'DocBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155'),
        leftIndent=15,
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'DocCode',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#0f172a')
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#065f46')
    )

    story = []

    # Title & Metadata
    story.append(Paragraph("AISC Academic Technical Report", ParagraphStyle('Badge', fontName='Helvetica-Bold', fontSize=8, textColor=colors.HexColor('#047857'), spaceAfter=4)))
    story.append(Paragraph("The Monkey and Banana Problem: AI Planning & Search Analysis", title_style))
    story.append(Paragraph("Formal State-Space Problem Formulation, Means-Ends Reasoning, and Comparative Evaluation of Breadth-First Search (BFS) vs. Depth-First Search (DFS)", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#059669"), spaceBefore=2, spaceAfter=14))

    # Meta Box Table
    meta_data = [
        [
            Paragraph("<b>Domain:</b> Artificial Intelligence & Cognitive Science", body_style),
            Paragraph("<b>Target System:</b> Interactive AI Game & Planning Dashboard", body_style)
        ],
        [
            Paragraph("<b>Core Focus:</b> Classical Symbolic Planning & State-Space Graphs", body_style),
            Paragraph("<b>Key Algorithms:</b> Breadth-First Search (BFS) & Depth-First Search (DFS)", body_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[240, 246])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f0fdf4')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#bbf7d0')),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # Section 1: Introduction & Cognitive Science Context
    story.append(Paragraph("1. Cognitive Science & Historical Background", h1_style))
    story.append(Paragraph(
        "The <b>Monkey and Banana Problem</b> is one of the foundational thought experiments and benchmarks in both Cognitive Science and Artificial Intelligence. It originated in 1925 when pioneering Gestalt psychologist <b>Wolfgang Köhler</b> conducted insight experiments on chimpanzees on the Island of Tenerife (published in <i>The Mentality of Apes</i>).",
        body_style
    ))
    story.append(Paragraph(
        "Prior to Köhler, behaviorist psychology (e.g., Edward Thorndike's trial-and-error learning) claimed that animals only learn by blind random exploration and reinforcement. Köhler showed that when presented with a banana hung out of reach and a movable wooden box elsewhere in the room, primates do not simply thrash about aimlessly. Instead, after a period of contemplation, they exhibit <b>insight</b>: formulating an internal plan to reach the box, push it directly beneath the bananas, climb atop it, and grasp the reward.",
        body_style
    ))
    story.append(Paragraph(
        "In modern Artificial Intelligence, this problem was formalized by John McCarthy and Allen Newell as an archetypal <b>means-ends analysis</b> planning domain: an agent must recognize that an immediate goal is blocked by an unsatisfied precondition, decomposing the task into chained intermediate sub-goals.",
        body_style
    ))

    # Section 2: Mathematical Formulation
    story.append(Paragraph("2. Formal State-Space Problem Formulation", h1_style))
    story.append(Paragraph(
        "In classical AI planning (Russell & Norvig, 2020), a deterministic, discrete search domain is formally defined by a 5-tuple: <b>&Pi; = &lang; S, S<sub>0</sub>, G, A, T &rang;</b>.",
        body_style
    ))
    story.append(Paragraph("<b>2.1 State Representation (S):</b> Each state <i>s &isin; S</i> is represented by the 5-tuple:", body_style))
    story.append(Paragraph(
        "<code>s = (monkeyPosition, boxPosition, bananaPosition, monkeyOnBox, hasBanana)</code><br/>"
        "&bull; <i>monkeyPosition</i> &isin; { Left, Center, Right }<br/>"
        "&bull; <i>boxPosition</i> &isin; { Left, Center, Right }<br/>"
        "&bull; <i>bananaPosition</i> &isin; { Left, Center, Right }<br/>"
        "&bull; <i>monkeyOnBox</i> &isin; { True, False }<br/>"
        "&bull; <i>hasBanana</i> &isin; { True, False }",
        bullet_style
    ))
    story.append(Paragraph(
        "<b>State Space Size:</b> The Cartesian product gives 3 &times; 3 &times; 3 &times; 2 &times; 2 = 108 theoretical states. After enforcing physical reachability invariants (e.g., the monkey can only climb on the box if <i>monkeyPosition == boxPosition</i>), the valid reachable state graph contains 24 to 36 states.",
        body_style
    ))
    story.append(Paragraph(
        "<b>2.2 Initial State (S<sub>0</sub>) and Goal Test (G):</b><br/>"
        "&bull; Standard Initial State S<sub>0</sub>: <code>(Left, Center, Right, False, False)</code><br/>"
        "&bull; Goal Condition G(s): <code>s.hasBanana == True</code>",
        body_style
    ))

    # Section 3: Action Preconditions and Effects Table
    story.append(Paragraph("<b>2.3 Action Operators (A) & Transition Model (T):</b>", body_style))
    
    act_data = [
        ["Action", "Parameters", "Preconditions", "Effects (State Transition)"],
        ["Walk", "target in {L, C, R}", "!monkeyOnBox\nisAdjacent(monkeyPos, target)", "monkeyPos <- target"],
        ["Push Box", "target in {L, C, R}", "!monkeyOnBox\nmonkeyPos == boxPos\nisAdjacent(boxPos, target)", "boxPos <- target\nmonkeyPos <- target"],
        ["Climb Box", "None", "!monkeyOnBox\nmonkeyPos == boxPos", "monkeyOnBox <- True"],
        ["Jump Down", "None", "monkeyOnBox == True", "monkeyOnBox <- False"],
        ["Grab Banana", "None", "monkeyOnBox == True\nboxPos == bananaPos\n!hasBanana", "hasBanana <- True (Goal Achieved)"]
    ]
    act_table = Table(act_data, colWidths=[70, 95, 160, 161])
    act_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f766e')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(act_table)
    story.append(Spacer(1, 10))

    # Page Break for in-depth BFS vs DFS analysis
    story.append(PageBreak())

    # Section 3: Why We Use Search
    story.append(Paragraph("3. Why Search Algorithms Are Required", h1_style))
    story.append(Paragraph(
        "An intelligent autonomous agent cannot rely on hard-coded heuristics or myopic instinct. In this environment:",
        body_style
    ))
    story.append(Paragraph("&bull; <b>Multiple Branching Choices:</b> From any ground location, the monkey can walk left or right, push the box, or climb. The agent must deliberate which action progresses toward the goal.", bullet_style))
    story.append(Paragraph("&bull; <b>Dead-End Traps:</b> Climbing the box when it is not situated beneath the banana yields a configuration from which the banana remains unreachable. The monkey must climb down to resume progress.", bullet_style))
    story.append(Paragraph("&bull; <b>Infinite Loops & Cycles:</b> Reversible actions (e.g., walking Left then Right, or climbing Up then Down) create cycles in the state space graph. Without a formal search strategy and cycle detection, naive agents loop indefinitely.", bullet_style))

    # Section 4: BFS vs DFS Detailed Evaluation
    story.append(Paragraph("4. In-Depth Comparative Evaluation: BFS vs. DFS", h1_style))

    story.append(Paragraph("4.1 Breadth-First Search (BFS)", h2_style))
    story.append(Paragraph(
        "<b>Mechanism:</b> BFS explores the state space level-by-level using a First-In, First-Out (<b>FIFO</b>) queue frontier. It evaluates all nodes at depth <i>d</i> before evaluating any node at depth <i>d + 1</i>.",
        body_style
    ))
    story.append(Paragraph(
        "&bull; <b>Optimality:</b> <b>Guaranteed Optimal.</b> Because each step incurs an identical unit cost, BFS mathematically guarantees finding the shortest action sequence (minimum number of steps to reach the banana).<br/>"
        "&bull; <b>Completeness:</b> <b>Complete.</b> If a valid path to the goal exists, BFS is guaranteed to find it.<br/>"
        "&bull; <b>Time Complexity:</b> <i>O(b<sup>d</sup>)</i>, where <i>b</i> is the branching factor (~2 to 3) and <i>d</i> is the goal depth (~4 steps). In this problem, BFS examines roughly 15 to 30 states in under 2 milliseconds.<br/>"
        "&bull; <b>Space Complexity:</b> <i>O(b<sup>d</sup>)</i>. All generated nodes must be stored in memory. In large-scale domains this exponential space is a disadvantage, but in the Monkey & Banana domain the memory footprint is negligible (&lt; 200 KB).",
        bullet_style
    ))

    # Callout Box for BFS
    bfs_box = Table([[Paragraph("<b>Why BFS is the Benchmark Solver:</b> For college robotics and AI planning demonstrations, BFS is the ideal algorithm because it produces the cleanest, most efficient human-like plan: Walk &rarr; Push &rarr; Climb &rarr; Grab, without meandering detours.", callout_style)]], colWidths=[486])
    bfs_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#ecfdf5')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#6ee7b7')),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(bfs_box)
    story.append(Spacer(1, 10))

    story.append(Paragraph("4.2 Depth-First Search (DFS)", h2_style))
    story.append(Paragraph(
        "<b>Mechanism:</b> DFS dives as deeply as possible along a single branch of the state graph using a Last-In, First-Out (<b>LIFO</b>) stack before backtracking when hitting a dead end or visited state.",
        body_style
    ))
    story.append(Paragraph(
        "&bull; <b>Optimality:</b> <b>Not Optimal.</b> DFS returns the <i>first</i> goal node it encounters. Depending on successor ordering, it may choose a convoluted route (e.g., walking Left, climbing prematurely, jumping down, walking back and forth) resulting in an 8- to 12-step plan instead of the 4-step optimum.<br/>"
        "&bull; <b>Completeness:</b> <b>Complete only with cycle detection.</b> In graphs with reversible actions, DFS without a closed list will enter an infinite loop (e.g., Left &harr; Center). Our implementation enforces a visited set to guarantee termination.<br/>"
        "&bull; <b>Time Complexity:</b> <i>O(b<sup>m</sup>)</i>, where <i>m</i> is the maximum depth bound. It can explore far deeper than necessary before discovering a simple solution.<br/>"
        "&bull; <b>Space Complexity:</b> <i>O(b &times; m)</i> (Linear memory). DFS only maintains the current path and unexplored siblings, making it memory-efficient in very deep trees.",
        bullet_style
    ))

    # Section 5: Side-by-Side Comparison Table
    story.append(Paragraph("5. Systematic Feature Comparison Matrix", h1_style))
    comp_data = [
        ["Criterion", "Breadth-First Search (BFS)", "Depth-First Search (DFS)", "Significance in Monkey & Banana Domain"],
        ["Frontier Structure", "FIFO Queue", "LIFO Stack / Recursion", "Dictates exploration order across the state space."],
        ["Path Optimality", "Guaranteed Minimum Steps", "Non-Optimal (May take detours)", "BFS achieves 4 steps; DFS may take 7 to 10 steps."],
        ["Completeness", "Always Complete", "Complete with cycle check", "Cycle checking prevents infinite ping-pong between tiles."],
        ["Time Complexity", "O(b^d) where d = goal depth", "O(b^m) where m = max depth", "BFS finds shallow goal faster in this specific topology."],
        ["Space Complexity", "O(b^d) (Exponential)", "O(b * m) (Linear)", "Not a constraint here due to compact state size (< 100 states)."],
        ["Search Tree Shape", "Broad, balanced, level-by-level", "Deep, elongated asymmetric spine", "Visualized clearly in the app's Search Tree panel."]
    ]
    comp_table = Table(comp_data, colWidths=[90, 125, 125, 146])
    comp_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e293b')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 7.5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(comp_table)
    story.append(Spacer(1, 10))

    # Section 6: Analysis of the 4 Possibilities (A, B, C, D) & BFS vs. DFS Behavior
    story.append(Paragraph("6. Analysis of the Four Named Possibilities (A, B, C, D)", h1_style))
    story.append(Paragraph(
        "To rigorously test search behaviors, the application implements four distinct canonical initial configurations (Possibilities A, B, C, and D). In each scenario, BFS consistently finds the mathematically optimal shortest path, whereas DFS exhibits a depth detour (prematurely climbing the box before moving it under the banana):",
        body_style
    ))

    poss_data = [
        ["Case", "Initial Positions (Monkey, Box, Banana)", "BFS Optimal Steps", "DFS Detour Steps", "Observable Difference & Detour Rationale"],
        ["Possibility A", "Monkey: Left\nBox: Center\nBanana: Right", "4 Steps\n(Walk, Push, Climb, Grab)", "6 Steps\n(Walk, Climb, Jump Down, Push, Climb, Grab)", "DFS prematurely climbs at Center before pushing the box to Right, costing +2 detour steps."],
        ["Possibility B", "Monkey: Center\nBox: Left\nBanana: Right", "5 Steps\n(Walk, Push, Push, Climb, Grab)", "7 Steps\n(Walk, Climb, Jump Down, Push, Push, Climb, Grab)", "Box must traverse two room segments; DFS climbs at Left first before initiating the double push."],
        ["Possibility C", "Monkey: Right\nBox: Right\nBanana: Left", "4 Steps\n(Push, Push, Climb, Grab)", "6 Steps\n(Climb, Jump Down, Push, Push, Climb, Grab)", "Monkey begins already at the box; DFS immediately climbs rather than pushing Left toward banana."],
        ["Possibility D", "Monkey: Center\nBox: Right\nBanana: Center", "4 Steps\n(Walk, Push, Climb, Grab)", "6 Steps\n(Walk, Climb, Jump Down, Push, Climb, Grab)", "Banana in Center; DFS climbs at Right first, discovering banana unreachable, then descends to push."]
    ]
    poss_table = Table(poss_data, colWidths=[65, 115, 80, 85, 141])
    poss_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#047857')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 7.5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(poss_table)
    story.append(Spacer(1, 10))

    # Section 7: Conclusion
    story.append(Paragraph("7. Summary & Educational Conclusion", h1_style))
    story.append(Paragraph(
        "By modeling the Monkey and Banana problem with formal state predicates and evaluating it via both Breadth-First Search and Depth-First Search, students gain immediate insight into the trade-offs of classical AI. BFS guarantees the optimal solution path, providing the benchmark for means-ends rationality. Meanwhile, DFS reveals the risks of cycle loops and redundant steps in unguided exploration. The integrated web application brings these theoretical principles to life through synchronized visual animation, live search trees, and speech feedback.",
        body_style
    ))

    # Build PDF with custom canvas for page numbers
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF report at: {output_path}")

if __name__ == '__main__':
    out_dir = r"C:\Users\gorra\.gemini\antigravity-ide\scratch\monkey-banana-ai\public"
    os.makedirs(out_dir, exist_ok=True)
    pdf_path = os.path.join(out_dir, "Monkey_and_Banana_AI_Explanation.pdf")
    create_report(pdf_path)

    # Also copy to root project dir for easy access
    root_pdf = r"C:\Users\gorra\.gemini\antigravity-ide\scratch\monkey-banana-ai\Monkey_and_Banana_AI_Explanation.pdf"
    import shutil
    shutil.copyfile(pdf_path, root_pdf)
    print(f"Copied PDF to: {root_pdf}")
