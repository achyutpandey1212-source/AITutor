# LUMO AI WORKSPACE

**Stage:** 3 — Page & Experience Architecture  
**Document:** 3.5  
**Status:** Design Specification  
**Product:** Lumo

---

## 1. Purpose

The **Lumo AI Workspace** is a focused, contextual AI interface available from within the learning experience.

It is not the primary classroom.

It is not a replacement for the Live Theater.

It is a dedicated space where a student can:

- ask doubts
- clarify concepts
- explore an idea
- ask follow-up questions
- reason through a problem
- ask document-specific questions
- request another explanation
- interact with Lumo without interrupting the main lesson

The workspace should feel familiar to students who have used modern AI assistants while remaining distinctly part of the Lumo learning environment.

The experience should feel closer to a **focused mini ChatGPT / Claude workspace** than a traditional educational chatbot.

---

# 2. Core Philosophy

The AI Workspace follows five principles:

1. **Context first**
2. **Low friction**
3. **Fast interaction**
4. **Clear model control**
5. **Learning-oriented responses**

The student should not need to repeatedly explain:

- what they are studying
- which lesson they are in
- which document they uploaded
- which concept was being discussed
- what question they are asking about

Lumo should already know the relevant context whenever it is available.

---

# 3. Relationship With Live Theater

The AI Workspace and Live Theater are complementary experiences.

### Live Theater

Purpose:

> Teach.

Theater controls the lesson flow:

```text
Understand
    ↓
Explain
    ↓
Demonstrate
    ↓
Question
    ↓
Evaluate
    ↓
Adapt
```

### Lumo AI Workspace

Purpose:

> Help the student explore, clarify and ask.

The workspace allows the student to temporarily step outside the main lesson flow.

---

# 4. Opening the Workspace

The workspace should be accessible from the Live Theater through a highly visible but non-intrusive control.

Possible labels:

- `Ask Lumo`
- `Lumo AI`
- `Ask a doubt`
- `Ask your tutor`

Preferred default:

> **Ask Lumo**

The control should remain available throughout the session.

It should not visually compete with:

- the lesson stage
- the tutor
- primary lesson controls

---

# 5. Workspace Presentation Modes

The workspace should support multiple presentation modes.

## 5.1 Desktop

Preferred:

### Side panel / contextual workspace

The Theater remains visible while the AI Workspace opens alongside it.

Conceptually:

```text
┌─────────────────────────────────────────────────────────────┐
│                       LUMO THEATER                          │
│                                                             │
│        Lesson stage                  AI Workspace           │
│        continues                  ┌─────────────────────┐   │
│                                   │ Ask Lumo            │   │
│                                   │                     │   │
│                                   │ context             │   │
│                                   │ aware conversation  │   │
│                                   │                     │   │
│                                   │                     │   │
│                                   │                     │   │
│                                   ├─────────────────────┤   │
│                                   │ Ask anything...     │   │
│                                   └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

The exact width may adapt according to viewport size.

---

## 5.2 Expanded Desktop Workspace

For deeper conversations, the workspace can expand into a larger focused mode.

The Theater should remain recoverable without losing state.

Example:

```text
┌──────────────────────────────────────────────────────────┐
│ ← Back to Theater                         Lumo AI         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│                    Conversation                         │
│                                                          │
│                                                          │
│                                                          │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ Ask a follow-up...                          Send         │
└──────────────────────────────────────────────────────────┘
```

---

## 5.3 Mobile

The workspace should become a full-screen experience.

```text
┌──────────────────────┐
│ ← Theater   Lumo AI  │
├──────────────────────┤
│                      │
│ Conversation         │
│                      │
│                      │
│                      │
├──────────────────────┤
│ Ask Lumo...      ↑   │
└──────────────────────┘
```

The student should not have to manage split-screen layouts on small devices.

---

# 6. Visual Direction

The workspace should inherit the Lumo Design System.

It must NOT become a completely separate visual product.

Use:

- Lumo typography
- Lumo spacing
- Lumo surfaces
- Lumo borders
- Lumo radius
- Lumo motion
- Lumo light/dark themes

The workspace may use slightly denser information presentation than the main Theater.

---

# 7. Interface Structure

The workspace consists of:

```text
Header
Context indicator
Conversation
Response actions
Composer
Model selector
Optional attachments/context controls
```

---

# 8. Header

The header should remain extremely simple.

Example:

```text
Lumo AI

Context: Physics · Newton's Laws

                    [Model ▼] [×]
```

Possible controls:

- close workspace
- expand workspace
- model selector
- context indicator

Avoid filling the header with unnecessary controls.

---

# 9. Context Indicator

Context should be visible but compact.

Example:

> `Physics · Newton's Laws`

or:

> `Class 10 Physics · Force & Motion`

If a document is active:

> `📄 NCERT Physics · Chapter 4`

The purpose is to reassure the student:

> "Lumo knows what I'm talking about."

---

# 10. Context Awareness

Lumo should automatically receive relevant context from the current learning session.

Possible context:

### Current subject

```text
Physics
```

### Current topic

```text
Newton's Laws
```

### Current lesson

```text
Newton's Second Law
```

### Current visual

```text
Force diagram
```

### Current teaching state

```text
Explaining relationship between
force, mass and acceleration.
```

### Recent conversation

Only the relevant recent turns should be included.

### Student performance context

When appropriate:

```text
Student previously struggled with:
Resistance
```

### Active document

If available:

```text
NCERT Physics Class 10
```

---

# 11. Context Boundaries

Context should be useful without becoming overwhelming.

Do NOT send the entire session history on every request.

Use a compact contextual representation.

Prefer:

```text
Current concept
+
Recent relevant turns
+
Active visual
+
Document retrieval
+
Relevant student state
```

rather than:

```text
Entire session transcript
```

This reduces:

- token usage
- latency
- unnecessary model processing
- context pollution

---

# 12. Conversation Behavior

The workspace should support natural conversational interaction.

Examples:

```text
Student:
Why does acceleration increase here?

Lumo:
Because the force is increasing while the mass
remains constant...
```

Then:

```text
Student:
Give me a real-world example.

Lumo:
Think about pushing an empty shopping cart...
```

Then:

```text
Student:
What if the mass doubles?
```

Lumo should understand that "mass" refers to the current concept.

---

# 13. Learning-Oriented Response Style

Lumo should behave as a tutor, not simply an answer generator.

Prefer:

```text
Explain
→ demonstrate
→ check understanding
```

rather than immediately dumping a final answer.

However, the student should be able to explicitly request:

> "Just give me the answer."

In that case Lumo can provide a concise answer.

---

# 14. Model Selector

The workspace should expose model choices without forcing students to understand technical infrastructure.

Do NOT expose:

```text
Gemini 3.6 Flash
Groq Llama...
Provider X...
```

Instead expose:

# Lumo Fast

Optimized for speed.

Use for:

- simple doubts
- short explanations
- quick follow-ups
- definitions
- conversational questions

---

# Lumo Light

Balanced speed and reasoning.

Use for:

- normal conceptual questions
- explanations
- document questions
- moderate problem solving

---

# Lumo Pro

Maximum reasoning capability available to the application.

Use for:

- difficult problems
- complex reasoning
- deep explanations
- multi-step analysis
- challenging document questions
- advanced programming/math/science questions

---

# 15. Model Selection UX

The selector should explain the difference in human terms.

Example:

```text
Choose your tutor

⚡ Lumo Fast
Quick answers
Best for simple questions

◐ Lumo Light
Balanced
Great for everyday learning

✦ Lumo Pro
Deep reasoning
Best for difficult problems
```

Do not expose provider implementation details.

The model abstraction should remain part of the Lumo product identity.

---

# 16. Default Model

The default should be:

> **Lumo Light**

unless the orchestration layer determines that another model is more appropriate.

The system may automatically route requests according to complexity.

Example:

```text
Simple question
      ↓
Lumo Fast

Normal question
      ↓
Lumo Light

Complex reasoning
      ↓
Lumo Pro
```

Manual selection should remain available.

---

# 17. Automatic Model Routing

Model selection should eventually support an automatic mode.

Example:

> `Auto`

The orchestration layer determines the most appropriate model.

Conceptually:

```text
Student question
      ↓
Intent / complexity detection
      ↓
┌───────────────┬────────────────┬───────────────┐
│ Simple        │ Moderate       │ Complex       │
│               │                │               │
↓               ↓                ↓
Fast            Light            Pro
```

This should optimize:

- latency
- cost
- model availability
- reasoning quality
- API quota usage

---

# 18. Document-Aware Questions

If a document is active, students should be able to ask questions about it directly.

Examples:

```text
Explain this chapter.

What does page 42 mean?

Summarize this section.

Which formula is important here?

Give me questions from this chapter.

Why does the author say this?
```

The RAG system should retrieve relevant document context.

---

# 19. Document Context Indicator

When document context is active, clearly communicate it.

Example:

```text
📄 Using:
NCERT Physics — Chapter 4
```

The student should know when Lumo is answering from their uploaded material.

---

# 20. Document Upload From Workspace

The workspace may provide an attachment/upload control.

However, uploading should not interrupt the conversation.

Example:

```text
+ Add context
```

Options:

```text
Upload document
Choose existing document
Current lesson
```

Uploaded documents should become available to the RAG pipeline.

---

# 21. Existing Documents

Students should not have to repeatedly upload the same document.

Provide:

> `Choose existing document`

Example:

```text
Your documents

📄 NCERT Physics
   Added 10 days ago

📄 Mathematics Practice Set
   Added 3 days ago

📄 Biology Notes
   Added yesterday
```

Selecting one establishes it as the active context.

---

# 22. Composer

The composer should be the primary interaction element.

Concept:

```text
┌──────────────────────────────────────────────┐
│ Ask Lumo anything...                         │
│                                              │
│                                    📎  ↑     │
└──────────────────────────────────────────────┘
```

It should support:

- text input
- multiline input
- attachments
- send
- keyboard submission
- mobile-friendly interaction

---

# 23. Voice Input

If voice input is available, the composer may include:

> 🎙

Voice input should follow the same unified turn pipeline used by the Live Theater.

Voice and typed questions should not create separate AI business logic.

---

# 24. Response Actions

Useful response actions:

- Copy
- Regenerate
- Ask follow-up
- Explain simpler
- Give example
- Make it harder
- Make it shorter

Do not show every action permanently.

Use progressive disclosure.

---

# 25. "Teach Me Differently"

A particularly useful learning action:

> **Explain differently**

This should route through the same pedagogical system used by the Theater.

Possible strategies:

```text
Simple explanation
Real-world analogy
Step-by-step
Visual explanation
Exam-style explanation
```

---

# 26. Visual Response Support

The workspace should eventually support richer responses when appropriate.

For example:

### Mathematics

Equations

### Physics

Diagrams

### Chemistry

Molecular structures

### Biology

Annotated diagrams

### Programming

Code blocks

### History

Timelines

The workspace should not force every answer into plain text.

---

# 27. Relationship With Visual Intelligence

If a question requires a visual explanation, Lumo may offer:

> **Show me**

This can trigger the Visual Strategy Engine.

Example:

```text
Student:
I don't understand how refraction works.

Lumo:
Want me to show you?

[Visualize it]
```

Selecting it may create or open a visual explanation.

---

# 28. Relationship With Theater

The workspace should be able to return the student to the exact Theater state.

For example:

```text
Theater:
Newton's Second Law
Visual: Force diagram
Playback: paused
Concept: Force vs acceleration
```

Student opens Lumo.

After closing:

```text
Same lesson
Same visual
Same playback state
Same concept
```

The workspace must not reset the classroom.

---

# 29. Contextual Launch

The strongest version of the workspace is context-aware launching.

For example, the student highlights a concept and clicks:

> `Ask Lumo`

The workspace opens with:

```text
You selected:

"Acceleration is proportional to force."

Ask Lumo about this...
```

This eliminates unnecessary typing.

---

# 30. Doubt Solver Flow

Example:

```text
Student is watching lesson.

        ↓

Student notices confusion.

        ↓

Clicks "Ask Lumo"

        ↓

Workspace opens.

        ↓

Context automatically attached.

        ↓

Student asks:
"Why does acceleration increase?"

        ↓

Lumo responds.

        ↓

Student asks follow-up.

        ↓

Student returns to Theater.
```

---

# 31. Responsive Behavior

## Desktop

Use:

- side panel
- expandable workspace
- persistent Theater context

## Tablet

Use:

- wider overlay
- partial Theater visibility where practical

## Mobile

Use:

- full-screen workspace
- clear back button
- bottom composer

---

# 32. Dark Theme

The workspace must support the Lumo dark theme.

Dark mode should not simply invert colors.

Maintain:

- readable contrast
- restrained surfaces
- clear hierarchy
- comfortable code blocks
- visible model selection
- accessible controls

The Lumo logo may switch to its white variant in dark mode.

---

# 33. Light Theme

The light theme should retain the **fruity Lumo identity**.

Use the established Lumo color system.

Avoid turning the workspace into a sterile white chatbot.

The workspace can use subtle colorful accents while maintaining strong negative space.

---

# 34. Loading States

Never display generic:

> Loading...

Prefer contextual states.

Examples:

> Lumo is thinking...

> Checking your document...

> Looking through your notes...

> Working through the problem...

For longer operations:

```text
Lumo is thinking

████████░░
```

The loading state should communicate what the system is doing whenever possible.

---

# 35. Error States

Errors should preserve the conversation.

Example:

> Something went wrong while generating that response.

Actions:

```text
Try again
Switch model
Continue conversation
```

Do not erase the student's message.

---

# 36. Model Failure / Provider Fallback

The user should not see provider-level failures.

Do NOT display:

```text
Gemini API failed.
Groq fallback activated.
```

Instead:

> Lumo is switching to another reasoning path...

or simply retry seamlessly.

The provider architecture remains invisible.

---

# 37. Slow Response Handling

If Lumo Pro is taking longer:

```text
Lumo Pro is working through this...
```

The interface should remain responsive.

The student should be able to:

- cancel
- switch model
- continue when appropriate

---

# 38. Conversation Persistence

Workspace conversations should be associated with the user's session/context where appropriate.

Students should be able to continue a doubt conversation without losing context.

However, temporary Theater-specific conversations should not necessarily become permanent chat histories unless explicitly designed to do so.

---

# 39. Conversation Memory

Use layered memory:

```text
Current message
      ↓
Recent workspace conversation
      ↓
Current Theater context
      ↓
Relevant session memory
      ↓
Document/RAG context
```

Avoid indiscriminately passing all historical data.

---

# 40. Security & Privacy

The workspace must not expose:

- API keys
- provider credentials
- internal prompts
- orchestration logic
- system configuration

Students should only see the Lumo experience.

---

# 41. Performance Principles

The workspace should prioritize perceived speed.

For simple requests:

```text
Question
↓
Fast routing
↓
Response
```

For complex requests:

```text
Question
↓
Complexity detection
↓
Deep reasoning
↓
Response
```

Do not use a heavyweight reasoning model for every trivial interaction.

---

# 42. Product Identity

The AI Workspace should reinforce:

> **Lumo is your learning companion.**

It should not feel like:

> "We embedded ChatGPT."

The distinction should come from:

- contextual awareness
- learning-specific actions
- document intelligence
- connection to Theater
- adaptive teaching behavior
- Lumo model abstraction
- visual learning capabilities

---

# 43. What Lumo AI Is NOT

Do not turn the workspace into:

### A generic chatbot

```text
Ask anything
↓
Generic answer
```

### A search engine

```text
Query
↓
Links
```

### A programming IDE

Unless specifically supporting coding tasks.

### A second dashboard

Avoid statistics and unnecessary panels.

### A replacement for Theater

Theater remains the primary teaching environment.

---

# 44. Demo Scenario

The AI Workspace should be demonstrated as part of the hackathon experience.

Example:

### Theater

Lumo teaches:

> "Resistance affects current according to Ohm's Law."

Student:

> "Wait, why?"

Clicks:

> **Ask Lumo**

Workspace opens.

Context automatically shows:

```text
Physics · Ohm's Law
```

Student asks:

> "Explain it using a real-world example."

Lumo responds:

> "Imagine water flowing through a pipe..."

The student asks:

> "So what happens if the pipe gets narrower?"

Lumo explains.

Student closes the workspace.

The Theater resumes.

This demonstrates:

**context → doubt → reasoning → clarification → return to learning**

---

# 45. Future Capabilities

The architecture should leave room for:

- voice conversations
- multimodal input
- image questions
- handwritten problem analysis
- code execution
- document comparison
- visual generation
- interactive simulations
- personalized study planning
- deeper RAG
- agentic learning workflows

These should not be implemented merely for the sake of feature count.

The priority remains:

> **A fast, contextual, genuinely useful learning assistant.**

---

# 46. Final UX Principle

The Lumo AI Workspace should always answer one question:

> **"How can I help this student understand what they're stuck on?"**

Not:

> "How many AI features can we put into this interface?"

The ideal experience is:

```text
Student gets confused
        ↓
Ask Lumo
        ↓
Lumo already knows the context
        ↓
Student asks naturally
        ↓
Lumo explains
        ↓
Student asks again
        ↓
Lumo adapts
        ↓
Student understands
        ↓
Return to learning
```

That loop is the heart of the workspace.

---

# 47. Design North Star

> **Lumo AI should feel like opening a brilliant tutor's notebook in the middle of a lesson — already knowing what you're studying, ready to help, and never making you start from zero.**
